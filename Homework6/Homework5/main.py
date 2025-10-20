from fastapi import FastAPI, Depends, HTTPException, Response, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import Base, engine, get_db
import models
import schemas

# Create tables
Base.metadata.create_all(bind=engine)

# -------------------- APP SETUP --------------------
app = FastAPI(title="Library API", version="1.0.0")

# Allow frontend access (React on port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------- HEALTH CHECK --------------------
@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "service": "library-api"}


# -------------------- AUTHORS CRUD --------------------
@app.post("/authors", response_model=schemas.AuthorOut, status_code=status.HTTP_201_CREATED)
def create_author(payload: schemas.AuthorCreate, db: Session = Depends(get_db)):
    exists = db.query(models.Author).filter(models.Author.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    author = models.Author(**payload.model_dump())
    db.add(author)
    db.commit()
    db.refresh(author)
    return author


@app.get("/authors", response_model=schemas.PaginatedAuthors)
def list_authors(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(models.Author)
    total = q.count()
    items = q.order_by(models.Author.id).offset((page - 1) * size).limit(size).all()
    return {"items": items, "page": page, "size": size, "total": total}


@app.get("/authors/{author_id}", response_model=schemas.AuthorOut)
def get_author(author_id: int, db: Session = Depends(get_db)):
    author = db.get(models.Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author


@app.put("/authors/{author_id}", response_model=schemas.AuthorOut)
def update_author(author_id: int, payload: schemas.AuthorUpdate, db: Session = Depends(get_db)):
    author = db.get(models.Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    if payload.email and payload.email != author.email:
        exists = db.query(models.Author).filter(models.Author.email == payload.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already registered")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(author, k, v)
    db.commit()
    db.refresh(author)
    return author


@app.delete("/authors/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_author(author_id: int, db: Session = Depends(get_db)):
    author = db.get(models.Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    has_books = db.query(models.Book).filter(models.Book.author_id == author_id).first()
    if has_books:
        raise HTTPException(status_code=400, detail="Cannot delete author with associated books")

    db.delete(author)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/authors/{author_id}/books", response_model=List[schemas.BookOut])
def books_by_author(author_id: int, db: Session = Depends(get_db)):
    author = db.get(models.Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return db.query(models.Book).filter(models.Book.author_id == author_id).order_by(models.Book.id).all()


# -------------------- BOOKS CRUD --------------------
@app.post("/books", response_model=schemas.BookOut, status_code=status.HTTP_201_CREATED)
def create_book(payload: schemas.BookCreate, db: Session = Depends(get_db)):
    if not db.get(models.Author, payload.author_id):
        raise HTTPException(status_code=400, detail="Author does not exist")

    exists = db.query(models.Book).filter(models.Book.isbn == payload.isbn).first()
    if exists:
        raise HTTPException(status_code=400, detail="ISBN already exists")

    book = models.Book(**payload.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@app.get("/books", response_model=List[schemas.BookOut])
def list_books(db: Session = Depends(get_db)):
    return db.query(models.Book).order_by(models.Book.id).all()


@app.get("/books/{book_id}", response_model=schemas.BookOut)
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.get(models.Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@app.put("/books/{book_id}", response_model=schemas.BookOut)
def update_book(book_id: int, payload: schemas.BookUpdate, db: Session = Depends(get_db)):
    book = db.get(models.Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if payload.isbn and payload.isbn != book.isbn:
        exists = db.query(models.Book).filter(models.Book.isbn == payload.isbn).first()
        if exists:
            raise HTTPException(status_code=400, detail="ISBN already exists")

    if payload.author_id and not db.get(models.Author, payload.author_id):
        raise HTTPException(status_code=400, detail="Author does not exist")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(book, k, v)
    db.commit()
    db.refresh(book)
    return book


@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.get(models.Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# -------------------- AI CHAT ROUTER --------------------
from ai_router import router as ai_router
app.include_router(ai_router)
