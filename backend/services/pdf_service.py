import fitz


def extract_text_from_pdf(pdf_path):

    pdf = fitz.open(pdf_path)

    text = ""

    for page in pdf:
        text += page.get_text()

    pdf.close()

    return text

def extract_metadata(pdf_path):

    pdf = fitz.open(pdf_path)

    first_page_text = pdf[0].get_text()

    pdf.close()

    lines = [
        line.strip()
        for line in first_page_text.split("\n")
        if line.strip()
    ]

    title = ""

    if len(lines) > 0:
        title = lines[0]

    return {
        "title": title
    }


def chunk_text(
    text,
    chunk_size=500,
    overlap=100
):

    words = text.split()

    chunks = []

    start = 0

    while start < len(words):

        end = start + chunk_size

        chunk = " ".join(
            words[start:end]
        )

        chunks.append(chunk)

        start += (
            chunk_size - overlap
        )

    print(
        "TOTAL CHUNKS:",
        len(chunks)
    )

    return chunks