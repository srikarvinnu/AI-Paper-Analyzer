import chromadb

client = None
collection = None


def get_collection():

    global client
    global collection

    if collection is None:

        client = chromadb.PersistentClient(
            path="chroma_db"
        )

        collection = client.get_or_create_collection(
            name="research_papers"
        )

    return collection


def store_chunks(
    conversation_id,
    chunks,
    embeddings
):

    collection = get_collection()

    ids = []

    metadatas = []

    for i in range(len(chunks)):

        ids.append(
            f"{conversation_id}_chunk_{i}"
        )

        metadatas.append(
            {
                "conversation_id":
                str(conversation_id)
            }
        )

    print(
        "FIRST METADATA =",
        metadatas[0]
    )

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas
    )

    print(
        "COLLECTION COUNT =",
        collection.count()
    )

    return len(ids)


def search_chunks(
    conversation_id,
    question_embedding,
    top_k=8
):

    collection = get_collection()

    print(
        "SEARCHING CONVERSATION:",
        conversation_id
    )

    try:

        results = collection.query(
            query_embeddings=[
                question_embedding
],
            n_results=top_k,
            where={
                "conversation_id":
                str(conversation_id)
            }
        )

        print(
            "RESULTS =",
            results
        )

        if (
            len(results["documents"]) == 0
            or
            len(results["documents"][0]) == 0
        ):
            return []

        return results["documents"][0]

    except Exception as e:

        print(
            "SEARCH ERROR =",
            str(e)
        )

        return []


def clear_collection():

    global collection
    global client

    collection = get_collection()

    try:

        client.delete_collection(
            name="research_papers"
        )

    except:
        pass

    collection = client.get_or_create_collection(
        name="research_papers"
    )