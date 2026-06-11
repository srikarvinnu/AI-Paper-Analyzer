from sentence_transformers import SentenceTransformer

model = None

def get_model():
    global model

    if model is None:
        model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

    return model


def create_embeddings(chunks):

    current_model = get_model()

    embeddings = current_model.encode(
        chunks
    )

    return embeddings