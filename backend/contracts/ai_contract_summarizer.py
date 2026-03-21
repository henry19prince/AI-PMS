# backend/contracts/ai_contract_summarizer.py
import fitz  # PyMuPDF
import re
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

KEY_TERMS = {
    "payment_terms": ["payment", "invoice", "due date", "amount", "terms of payment"],
    "penalty_clauses": ["penalty", "late fee", "liquidated damages", "fine", "breach"],
    "delivery_schedules": ["delivery", "shipment", "schedule", "timeline", "dispatch"],
    "contract_duration": ["duration", "valid until", "expiry", "term", "period"],
    "compliance_obligations": ["compliance", "regulatory", "legal", "obligation", "requirement"]
}

def extract_text_from_pdf(file_path):
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def preprocess_text(text):
    text = re.sub(r'\s+', ' ', text).strip()
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if len(s.strip()) > 10]

def summarize_contract(file_path):
    raw_text = extract_text_from_pdf(file_path)
    sentences = preprocess_text(raw_text)

    # Get embeddings
    embeddings = model.encode(sentences)

    # Score sentences
    scores = []
    for i, sent in enumerate(sentences):
        score = 0.0
        sent_lower = sent.lower()
        
        # Boost for key clauses
        for clause, keywords in KEY_TERMS.items():
            if any(kw in sent_lower for kw in keywords):
                score += 0.45
        
        # Semantic importance (cosine similarity to overall document)
        doc_embedding = np.mean(embeddings, axis=0)
        sim = cosine_similarity([embeddings[i]], [doc_embedding])[0][0]
        score += sim * 0.55
        
        scores.append(score)

    # Select top 8-10 sentences
    top_indices = np.argsort(scores)[-10:][::-1]
    summary_sentences = [sentences[i] for i in top_indices]

    # Extract structured key clauses
    key_clauses = {}
    for clause_name, keywords in KEY_TERMS.items():
        for sent in summary_sentences:
            if any(kw in sent.lower() for kw in keywords):
                key_clauses[clause_name] = sent
                break

    final_summary = " ".join(summary_sentences[:8])

    return {
        "summary": final_summary,
        "key_clauses": key_clauses,
        "confidence": round(float(np.mean(scores)), 2)
    }