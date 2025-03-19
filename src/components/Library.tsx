import { LibraryBook, useLibrary } from "../contexts/LibraryContext";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
} from "@mui/material";
import LibraryUpload from "./LibraryUpload";
import { useEffect, useState } from "react";

const Library = () => {
  const { books, addBooks } = useLibrary();
  const [updatedBooks, setUpdatedBooks] = useState<LibraryBook[]>([]);

  useEffect(() => {
    const fetchCoverImages = async () => {
      const booksToUpdate = await Promise.all(
        books.map(async (book) => {
          if (!book.cover_i && book.isbn) {
            try {
              const response = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(book.isbn)}`,
              );
              const data = await response.json();
              if (data && data.docs.length > 0) {
                const cover_i = data.docs[0].cover_i;
                return { ...book, cover_i };
              }
            } catch (error) {
              console.error("Error fetching cover image:", error);
            }
          }
          return book;
        }),
      );
      setUpdatedBooks(booksToUpdate);
      addBooks(booksToUpdate);
    };

    fetchCoverImages();
  }, []); // Run only once when the component is mounted

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 4, width: 900 }}>
        <LibraryUpload />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          My Library ({books.length} books)
        </Typography>

        {books.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
            Your library is empty. Please upload a CSV file to import your books
            or start searching.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {updatedBooks.map((book: LibraryBook, index) => (
              <Grid item xs={12} sm={6} md={4} key={book.isbn || index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {book.cover_i && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                      alt={book.title}
                      sx={{ objectFit: "contain", pt: 2 }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2" noWrap>
                      {book.title}
                    </Typography>
                    {book.author && (
                      <Typography variant="body2" color="text.secondary">
                        By {book.author}
                      </Typography>
                    )}
                    {book.published && (
                      <Typography variant="body2" color="text.secondary">
                        Published: {book.published}
                      </Typography>
                    )}
                    {book.status && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          fontWeight: "bold",
                          color:
                            book.status.toLowerCase() === "read"
                              ? "success.main"
                              : book.status.toLowerCase() === "reading"
                                ? "info.main"
                                : "text.secondary",
                        }}
                      >
                        Status: {book.status}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </>
  );
};

export default Library;
