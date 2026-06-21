from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

Base = declarative_base()
engine = create_engine('sqlite:///hiresense.db', echo=False)
Session = sessionmaker(bind=engine)

class Job(Base):
    __tablename__ = 'jobs'
    id         = Column(Integer, primary_key=True)
    title      = Column(String(255), default='Untitled Position')
    description= Column(Text, nullable=False)
    keywords   = Column(Text, default='')   # JSON list stored as string
    created_at = Column(DateTime, default=datetime.utcnow)
    candidates = relationship('Candidate', back_populates='job', cascade='all, delete-orphan')

class Candidate(Base):
    __tablename__ = 'candidates'
    id          = Column(Integer, primary_key=True)
    job_id      = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    name        = Column(String(255), default='Unknown')
    email       = Column(String(255), default='')
    filename    = Column(String(255), default='')
    raw_text    = Column(Text, default='')
    created_at  = Column(DateTime, default=datetime.utcnow)
    job         = relationship('Job', back_populates='candidates')
    result      = relationship('MatchResult', back_populates='candidate', uselist=False, cascade='all, delete-orphan')

class MatchResult(Base):
    __tablename__ = 'match_results'
    id               = Column(Integer, primary_key=True)
    candidate_id     = Column(Integer, ForeignKey('candidates.id'), nullable=False)
    job_id           = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    overall_score    = Column(Float, default=0.0)
    skills_score     = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    education_score  = Column(Float, default=0.0)
    cert_score       = Column(Float, default=0.0)
    matched_skills   = Column(Text, default='')   # JSON
    missing_skills   = Column(Text, default='')   # JSON
    recommendation   = Column(Text, default='')
    shortlisted      = Column(Integer, default=0) # 0 or 1
    candidate        = relationship('Candidate', back_populates='result')

def init_db():
    Base.metadata.create_all(engine)

def get_session():
    return Session()
