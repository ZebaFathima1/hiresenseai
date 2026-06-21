"""
app.py – HireSense AI Flask REST API
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from models import init_db, get_session, Job, Candidate, MatchResult
from parser import parse_resume
from nlp_engine import score_resume, extract_keywords

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ── Init DB ────────────────────────────────────
init_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ── Routes ─────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'HireSense AI'})


@app.route('/api/job', methods=['POST'])
def create_job():
    """Save a job description and extract keywords."""
    data = request.get_json()
    if not data or not data.get('description'):
        return jsonify({'error': 'description is required'}), 400

    kws = extract_keywords(data['description'])

    session = get_session()
    try:
        job = Job(
            title=data.get('title', 'Untitled Position'),
            description=data['description'],
            keywords=json.dumps(kws),
        )
        session.add(job)
        session.commit()
        session.refresh(job)
        return jsonify({
            'id':       job.id,
            'title':    job.title,
            'keywords': kws,
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/job/<int:job_id>', methods=['GET'])
def get_job(job_id):
    session = get_session()
    try:
        job = session.get(Job, job_id)
        if not job:
            return jsonify({'error': 'Not found'}), 404
        return jsonify({
            'id':          job.id,
            'title':       job.title,
            'description': job.description,
            'keywords':    json.loads(job.keywords) if job.keywords else [],
        })
    finally:
        session.close()


@app.route('/api/upload', methods=['POST'])
def upload_resumes():
    """Upload one or more resumes and compute match scores against a job."""
    job_id = request.form.get('job_id')
    if not job_id:
        return jsonify({'error': 'job_id is required'}), 400

    session = get_session()
    try:
        job = session.get(Job, int(job_id))
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        files = request.files.getlist('resumes')
        if not files:
            return jsonify({'error': 'No files uploaded'}), 400

        results = []
        for f in files:
            if not f or not allowed_file(f.filename):
                continue

            filename = secure_filename(f.filename)
            parsed   = parse_resume(f.stream, filename)
            scores   = score_resume(parsed['text'], job.description)

            candidate = Candidate(
                job_id   = job.id,
                name     = parsed['name'],
                email    = parsed['email'],
                filename = filename,
                raw_text = parsed['text'][:10000],  # cap for DB
            )
            session.add(candidate)
            session.flush()  # get candidate.id

            match = MatchResult(
                candidate_id     = candidate.id,
                job_id           = job.id,
                overall_score    = scores['overall_score'],
                skills_score     = scores['skills_score'],
                experience_score = scores['experience_score'],
                education_score  = scores['education_score'],
                cert_score       = scores['cert_score'],
                matched_skills   = scores['matched_skills'],
                missing_skills   = scores['missing_skills'],
                recommendation   = scores['recommendation'],
                shortlisted      = scores['shortlisted'],
            )
            session.add(match)
            session.flush()

            results.append({
                'candidate_id':    candidate.id,
                'name':            candidate.name,
                'email':           candidate.email,
                'filename':        filename,
                'overall_score':   scores['overall_score'],
                'shortlisted':     bool(scores['shortlisted']),
            })

        session.commit()
        return jsonify({'uploaded': len(results), 'results': results}), 201

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/candidates/<int:job_id>', methods=['GET'])
def get_candidates(job_id):
    """Return ranked candidates for a job."""
    session = get_session()
    try:
        candidates = (
            session.query(Candidate, MatchResult)
            .join(MatchResult, Candidate.id == MatchResult.candidate_id)
            .filter(Candidate.job_id == job_id)
            .order_by(MatchResult.overall_score.desc())
            .all()
        )

        data = []
        for rank, (c, m) in enumerate(candidates, start=1):
            data.append({
                'rank':             rank,
                'candidate_id':     c.id,
                'name':             c.name,
                'email':            c.email,
                'filename':         c.filename,
                'overall_score':    m.overall_score,
                'skills_score':     m.skills_score,
                'experience_score': m.experience_score,
                'education_score':  m.education_score,
                'cert_score':       m.cert_score,
                'shortlisted':      bool(m.shortlisted),
                'recommendation':   m.recommendation,
                'matched_skills':   json.loads(m.matched_skills) if m.matched_skills else [],
                'missing_skills':   json.loads(m.missing_skills) if m.missing_skills else [],
            })
        return jsonify(data)
    finally:
        session.close()


@app.route('/api/analytics/<int:job_id>', methods=['GET'])
def get_analytics(job_id):
    """Return analytics summary for a job."""
    session = get_session()
    try:
        results = (
            session.query(MatchResult)
            .filter(MatchResult.job_id == job_id)
            .all()
        )

        if not results:
            return jsonify({
                'total': 0, 'avg_score': 0,
                'shortlisted': 0, 'distribution': []
            })

        scores   = [r.overall_score for r in results]
        avg      = round(sum(scores) / len(scores), 1)
        shortlisted = sum(1 for r in results if r.shortlisted)

        # Score distribution buckets
        buckets = {'0-30': 0, '31-50': 0, '51-70': 0, '71-85': 0, '86-100': 0}
        for s in scores:
            if s <= 30:   buckets['0-30']   += 1
            elif s <= 50: buckets['31-50']  += 1
            elif s <= 70: buckets['51-70']  += 1
            elif s <= 85: buckets['71-85']  += 1
            else:         buckets['86-100'] += 1

        distribution = [{'range': k, 'count': v} for k, v in buckets.items()]

        return jsonify({
            'total':        len(results),
            'avg_score':    avg,
            'shortlisted':  shortlisted,
            'top_score':    max(scores),
            'distribution': distribution,
        })
    finally:
        session.close()


@app.route('/api/report/<int:candidate_id>', methods=['GET'])
def get_report(candidate_id):
    """Return detailed report for one candidate."""
    session = get_session()
    try:
        c = session.get(Candidate, candidate_id)
        if not c:
            return jsonify({'error': 'Not found'}), 404
        m = c.result
        return jsonify({
            'candidate_id':     c.id,
            'name':             c.name,
            'email':            c.email,
            'filename':         c.filename,
            'overall_score':    m.overall_score,
            'skills_score':     m.skills_score,
            'experience_score': m.experience_score,
            'education_score':  m.education_score,
            'cert_score':       m.cert_score,
            'shortlisted':      bool(m.shortlisted),
            'matched_skills':   json.loads(m.matched_skills) if m.matched_skills else [],
            'missing_skills':   json.loads(m.missing_skills) if m.missing_skills else [],
            'recommendation':   m.recommendation,
        })
    finally:
        session.close()


@app.route('/api/reset/<int:job_id>', methods=['DELETE'])
def reset_job(job_id):
    """Delete all candidates for a job (keep job itself)."""
    session = get_session()
    try:
        candidates = session.query(Candidate).filter(Candidate.job_id == job_id).all()
        for c in candidates:
            session.delete(c)
        session.commit()
        return jsonify({'message': 'Reset successful'})
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5000)
