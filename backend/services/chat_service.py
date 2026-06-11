import sqlite3
from turtle import title

DB_NAME = "chat_history.db"


def init_db():
    print("Creating tables...")
    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT,
        title TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER,
        role TEXT,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(conversation_id)
        REFERENCES conversations(id)
    )
    """)
    cursor.execute("""
CREATE TABLE IF NOT EXISTS uploaded_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER,
    filename TEXT,
    filepath TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id)
    REFERENCES conversations(id)
)
""")

    conn.commit()
    print("Tables created successfully")
    conn.close()


def create_conversation(
    title,
    user_email
):

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO conversations(
    title,
    user_email
)
VALUES(?, ?)
        """,
        (title,user_email)
    )


    conversation_id = cursor.lastrowid
    print(
    "Creating conversation:",
    title,
    user_email
)
    conn.commit()
    conn.close()

    return conversation_id


def save_message(
    conversation_id,
    role,
    content
):

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO messages(
            conversation_id,
            role,
            content
        )
        VALUES (?, ?, ?)
        """,
        (
            conversation_id,
            role,
            content
        )
    )

    conn.commit()
    conn.close()


def get_conversations(
    user_email
):
    print(
    "Loading conversations for:",
    user_email
)

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute(
    """
    SELECT *
    FROM conversations
    WHERE user_email=?
    ORDER BY created_at DESC
    """,
    (user_email,)
)

    rows = cursor.fetchall()
    print(
    "Rows:",
    rows
)

    conn.close()

    return rows

def get_messages(
    conversation_id
):

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT role, content
        FROM messages
        WHERE conversation_id=?
        ORDER BY created_at ASC
        """,
        (conversation_id,)
    )

    rows = cursor.fetchall()

    conn.close()

    return rows
def delete_conversation(
    conversation_id
):

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM messages
        WHERE conversation_id=?
        """,
        (conversation_id,)
    )

    cursor.execute(
        """
        DELETE FROM conversations
        WHERE id=?
        """,
        (conversation_id,)
    )

    conn.commit()
    conn.close()
def rename_conversation(
    conversation_id,
    title
):

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE conversations
        SET title=?
        WHERE id=?
        """,
        (
            title,
            conversation_id
        )
    )

    conn.commit()
    conn.close()


def update_conversation_title(
    conversation_id,
    title
):

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE conversations
        SET title=?
        WHERE id=?
        """,
        (
            title,
            conversation_id
        )
    )

    conn.commit()
    conn.close()
def save_uploaded_file(
    conversation_id,
    filename,
    filepath
):

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO uploaded_files(
            conversation_id,
            filename,
            filepath
        )
        VALUES (?, ?, ?)
        """,
        (
            conversation_id,
            filename,
            filepath
        )
    )

    conn.commit()
    conn.close()


def get_uploaded_file(
    conversation_id
):

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT filename, filepath
        FROM uploaded_files
        WHERE conversation_id=?
        ORDER BY id DESC
        LIMIT 1
        """,
        (conversation_id,)
    )

    row = cursor.fetchone()

    conn.close()

    return row