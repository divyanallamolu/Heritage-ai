from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./heritageai.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def initialize_database():
    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        inspector = inspect(conn)
        table_names = inspector.get_table_names()

        if "interviews" in table_names:
            interview_columns = {column["name"] for column in inspector.get_columns("interviews")}
            if "user_id" not in interview_columns:
                conn.execute(text("ALTER TABLE interviews ADD COLUMN user_id INTEGER"))

        # Existing installations may predate the user timestamp column. Without
        # this migration, SQLAlchemy's register response can fail after insert.
        if "users" in table_names:
            user_columns = {column["name"] for column in inspector.get_columns("users")}
            if "created_at" not in user_columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME"))
                conn.execute(text("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
