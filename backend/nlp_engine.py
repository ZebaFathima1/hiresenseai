"""
nlp_engine.py – Core AI matching engine for HireSense AI.

Uses:
  - sklearn TF-IDF + Cosine Similarity  (overall semantic match)
  - Keyword set intersection            (skills match)
  - Regex patterns                      (experience years, education, certs)
  - Weighted scoring formula            (Skills 40%, Exp 30%, Edu 20%, Cert 10%)
"""

import re
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ──────────────────────────────────────────────
# Keyword dictionaries
# ──────────────────────────────────────────────

TECH_SKILLS = {
    "python","java","javascript","typescript","c++","c#","go","rust","swift","kotlin",
    "react","angular","vue","node","django","flask","fastapi","spring","laravel",
    "sql","mysql","postgresql","mongodb","redis","elasticsearch","sqlite",
    "aws","azure","gcp","docker","kubernetes","terraform","ansible","jenkins","ci/cd",
    "machine learning","deep learning","nlp","computer vision","tensorflow","pytorch",
    "scikit-learn","pandas","numpy","matplotlib","seaborn","spark","hadoop","kafka",
    "git","linux","bash","powershell","rest api","graphql","microservices","agile","scrum",
    "html","css","sass","tailwind","bootstrap","figma","photoshop",
    "data analysis","data science","data engineering","etl","tableau","power bi",
    "cybersecurity","networking","devops","cloud","blockchain","iot","embedded systems",
}

SOFT_SKILLS = {
    "communication","leadership","teamwork","problem solving","critical thinking",
    "time management","adaptability","creativity","collaboration","project management",
    "analytical","detail-oriented","motivated","organized","multitasking",
}

EDUCATION_KEYWORDS = {
    "bachelor","master","phd","b.sc","m.sc","b.e","m.e","b.tech","m.tech",
    "b.s","m.s","associate","diploma","degree","mba","b.com","m.com",
    "bachelor of science","master of science","doctor of philosophy",
    "computer science","information technology","software engineering",
    "electrical engineering","mechanical engineering","data science",
}

CERT_KEYWORDS = {
    "certified","certification","certificate","aws certified","azure certified",
    "google certified","pmp","cpa","cfa","cissp","cism","comptia","ccna","ccnp",
    "oracle certified","microsoft certified","scrum master","safe","togaf",
    "tensorflow developer","tensorflow","pytorch certification","databricks",
    "coursera","udemy","edx","linkedin learning",
}

# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def normalise(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s\.\+#]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def tokenise_ngrams(text: str):
    """Return set of 1-gram and 2-gram tokens from text."""
    words = text.split()
    unigrams = set(words)
    bigrams  = {f"{words[i]} {words[i+1]}" for i in range(len(words)-1)}
    return unigrams | bigrams

def extract_keywords(text: str) -> list:
    """
    Extract important keywords from a job description using TF-IDF
    and supplement with tech/soft skill intersection.
    """
    norm = normalise(text)
    tokens = tokenise_ngrams(norm)

    # Direct keyword matching against our dictionaries
    skills = (tokens & TECH_SKILLS) | (tokens & SOFT_SKILLS)

    # TF-IDF on single document to get high-weight terms
    try:
        vec = TfidfVectorizer(ngram_range=(1,2), stop_words='english', max_features=40)
        vec.fit([norm])
        tfidf_terms = set(vec.get_feature_names_out())
        # Filter to meaningful terms (length > 2)
        tfidf_terms = {t for t in tfidf_terms if len(t) > 2}
        skills |= tfidf_terms
    except Exception:
        pass

    return sorted(list(skills))

# ──────────────────────────────────────────────
# Scoring sub-functions
# ──────────────────────────────────────────────

def cosine_score(text1: str, text2: str) -> float:
    """Return cosine similarity (0-1) between two text documents."""
    try:
        vec = TfidfVectorizer(stop_words='english', ngram_range=(1,2))
        mat = vec.fit_transform([normalise(text1), normalise(text2)])
        score = cosine_similarity(mat[0], mat[1])[0][0]
        return round(float(score), 4)
    except Exception:
        return 0.0

def skills_score(resume_text: str, jd_text: str) -> tuple:
    """
    Returns (score_0_to_100, matched_skills_list, missing_skills_list).
    Based on keyword intersection against dictionaries + JD keywords.
    """
    r_norm = normalise(resume_text)
    j_norm = normalise(jd_text)

    r_tokens = tokenise_ngrams(r_norm)
    j_tokens = tokenise_ngrams(j_norm)

    # Extract skills mentioned in JD
    jd_tech   = j_tokens & TECH_SKILLS
    jd_soft   = j_tokens & SOFT_SKILLS
    jd_skills = jd_tech | jd_soft

    if not jd_skills:
        # Fall back to cosine
        return round(cosine_score(resume_text, jd_text) * 100, 1), [], []

    matched = jd_skills & r_tokens
    missing = jd_skills - r_tokens

    score = (len(matched) / len(jd_skills)) * 100
    return round(score, 1), sorted(list(matched)), sorted(list(missing))

def experience_score(resume_text: str, jd_text: str) -> float:
    """
    Heuristic: extract years of experience required from JD,
    and years found in resume. Returns 0-100.
    """
    # Parse required years from JD
    req_match = re.search(r'(\d+)\+?\s*(?:to\s*\d+)?\s*years?\s*(?:of\s*)?(?:experience|exp)', jd_text, re.IGNORECASE)
    required_years = int(req_match.group(1)) if req_match else 0

    # Parse years from resume
    found_years_list = re.findall(r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp|work)', resume_text, re.IGNORECASE)
    resume_years = max([int(y) for y in found_years_list], default=0)

    # Also count number of distinct job entries as proxy
    job_entries = len(re.findall(r'\b(20\d{2}|19\d{2})\b', resume_text))
    proxy_years = max(job_entries // 2, 0)
    resume_years = max(resume_years, proxy_years)

    if required_years == 0:
        # No explicit req – give partial credit if resume mentions experience
        return 70.0 if resume_years > 0 else 50.0

    ratio = min(resume_years / required_years, 1.5)  # cap at 150%
    score = min(ratio * 100, 100)
    return round(score, 1)

def education_score(resume_text: str, jd_text: str) -> float:
    """
    Check if resume's education level meets JD requirements.
    Returns 0-100.
    """
    r_norm = normalise(resume_text)
    j_norm = normalise(jd_text)

    jd_edu   = tokenise_ngrams(j_norm) & EDUCATION_KEYWORDS
    res_edu  = tokenise_ngrams(r_norm) & EDUCATION_KEYWORDS

    if not jd_edu:
        return 80.0 if res_edu else 60.0

    # Degree hierarchy scoring
    hierarchy = ['associate','diploma','bachelor','b.sc','b.s','b.e','b.tech','b.com',
                 'master','m.sc','m.s','m.e','m.tech','m.com','mba','phd']

    def max_level(keywords):
        lvl = -1
        for k in keywords:
            for i, h in enumerate(hierarchy):
                if h in k:
                    lvl = max(lvl, i)
        return lvl

    req_lvl = max_level(jd_edu)
    res_lvl = max_level(res_edu)

    if req_lvl < 0:
        return 80.0
    if res_lvl >= req_lvl:
        return 100.0
    elif res_lvl == req_lvl - 1:
        return 70.0
    elif res_lvl == req_lvl - 2:
        return 50.0
    else:
        return 30.0

def cert_score(resume_text: str, jd_text: str) -> float:
    """Check certification mentions. Returns 0-100."""
    r_norm = normalise(resume_text)
    j_norm = normalise(jd_text)

    jd_certs  = tokenise_ngrams(j_norm) & CERT_KEYWORDS
    res_certs = tokenise_ngrams(r_norm) & CERT_KEYWORDS

    if not jd_certs:
        return 100.0 if res_certs else 70.0

    matched = jd_certs & res_certs
    score = (len(matched) / len(jd_certs)) * 100
    return round(min(score, 100), 1)

# ──────────────────────────────────────────────
# Main scoring function
# ──────────────────────────────────────────────

WEIGHTS = {
    'skills':     0.40,
    'experience': 0.30,
    'education':  0.20,
    'cert':       0.10,
}

def score_resume(resume_text: str, jd_text: str) -> dict:
    """
    Full scoring pipeline. Returns dict suitable for MatchResult model.
    """
    sk_score, matched, missing = skills_score(resume_text, jd_text)
    ex_score = experience_score(resume_text, jd_text)
    ed_score = education_score(resume_text, jd_text)
    ct_score = cert_score(resume_text, jd_text)

    # Apply cosine as a global signal to slightly adjust skills score
    cos = cosine_score(resume_text, jd_text) * 100
    blended_skills = round((sk_score * 0.7 + cos * 0.3), 1)

    overall = round(
        blended_skills * WEIGHTS['skills'] +
        ex_score * WEIGHTS['experience'] +
        ed_score * WEIGHTS['education'] +
        ct_score * WEIGHTS['cert'],
        1
    )

    shortlisted = 1 if overall >= 70 else 0

    recommendation = generate_recommendation(
        overall, blended_skills, ex_score, ed_score, ct_score,
        matched, missing
    )

    return {
        'overall_score':    overall,
        'skills_score':     blended_skills,
        'experience_score': ex_score,
        'education_score':  ed_score,
        'cert_score':       ct_score,
        'matched_skills':   json.dumps(matched[:15]),
        'missing_skills':   json.dumps(missing[:15]),
        'recommendation':   recommendation,
        'shortlisted':      shortlisted,
    }

def generate_recommendation(overall, skills, exp, edu, cert, matched, missing) -> str:
    lines = []
    if overall >= 85:
        lines.append("🌟 Excellent match – highly recommended for immediate shortlisting.")
    elif overall >= 70:
        lines.append("✅ Strong candidate – meets most requirements.")
    elif overall >= 50:
        lines.append("⚠️ Moderate match – consider further assessment.")
    else:
        lines.append("❌ Weak match – significant skill gaps identified.")

    if matched:
        lines.append(f"✔ Matched skills: {', '.join(matched[:8])}.")
    if missing:
        lines.append(f"✘ Missing skills: {', '.join(missing[:8])}.")

    if exp < 50:
        lines.append("⚠ Candidate may be under-experienced for this role.")
    if edu < 60:
        lines.append("⚠ Education may not fully meet stated requirements.")
    if cert < 60:
        lines.append("⚠ Required certifications not clearly found in resume.")

    return " ".join(lines)
