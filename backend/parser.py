import re
import io

def extract_text_from_pdf(file_stream) -> str:
    """Extract plain text from a PDF file stream using PyPDF2."""
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(file_stream)
        text_parts = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
        return "\n".join(text_parts)
    except Exception as e:
        return ""

def extract_text_from_docx(file_stream) -> str:
    """Extract plain text from a DOCX file stream using python-docx."""
    try:
        from docx import Document
        doc = Document(file_stream)
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    except Exception as e:
        return ""

def extract_candidate_name(text: str) -> str:
    """Heuristic: assume name is in the first 3 non-empty lines."""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines[:5]:
        # Skip lines that look like headers, emails, or phone numbers
        if re.search(r'[@|resume|cv|curriculum|phone|email|\d{5,}]', line, re.IGNORECASE):
            continue
        # Name should be 2-4 words, all alphabetic (allow hyphens)
        words = line.split()
        if 2 <= len(words) <= 4 and all(re.match(r"^[A-Za-z\-'.]+$", w) for w in words):
            return line.title()
    return "Unknown Candidate"

def extract_email(text: str) -> str:
    """Extract first email address found in text."""
    match = re.search(r'[\w.\-+]+@[\w\-]+\.[a-zA-Z]{2,}', text)
    return match.group(0) if match else ""

def parse_resume(file_stream, filename: str) -> dict:
    """
    Main entry point. Returns dict with:
      text, name, email
    """
    fname_lower = filename.lower()
    if fname_lower.endswith('.pdf'):
        text = extract_text_from_pdf(file_stream)
    elif fname_lower.endswith('.docx') or fname_lower.endswith('.doc'):
        text = extract_text_from_docx(file_stream)
    else:
        text = file_stream.read().decode('utf-8', errors='ignore')

    name  = extract_candidate_name(text)
    email = extract_email(text)
    return {'text': text, 'name': name, 'email': email}
