import re
import nltk
import numpy as np
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

stop_words = set(stopwords.words('english'))
model = SentenceTransformer('all-MiniLM-L6-v2')


def preprocess_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def rank_sentences(sentences):
    embeddings = model.encode(sentences)
    doc_embedding = np.mean(embeddings, axis=0)
    scores = cosine_similarity([doc_embedding], embeddings)[0]
    ranked = sorted(((scores[i], s) for i, s in enumerate(sentences)), reverse=True)
    return [s for _, s in ranked[:10]]


def extract_clauses(sentences, keywords):
    results = []
    for s in sentences:
        for kw in keywords:
            if kw in s.lower():
                results.append(s)
                break
    return " ".join(results[:5])


def summarize_contract(text):
    cleaned = preprocess_text(text)
    sentences = sent_tokenize(cleaned)

    top_sentences = rank_sentences(sentences)

    payment_terms = extract_clauses(top_sentences, ["payment", "invoice", "fee", "amount"])
    penalty_clauses = extract_clauses(top_sentences, ["penalty", "fine", "breach", "liability"])
    delivery_schedule = extract_clauses(top_sentences, ["delivery", "shipment", "deadline", "schedule"])
    contract_duration = extract_clauses(top_sentences, ["duration", "term", "period", "effective"])
    compliance_obligations = extract_clauses(top_sentences, ["compliance", "law", "regulation", "obligation"])

    full_summary = " ".join(top_sentences)

    return {
        "payment_terms": payment_terms,
        "penalty_clauses": penalty_clauses,
        "delivery_schedule": delivery_schedule,
        "contract_duration": contract_duration,
        "compliance_obligations": compliance_obligations,
        "full_summary": full_summary
    }