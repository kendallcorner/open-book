import {
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useState } from "react";
import { OpenBookAPIBook } from "../contexts/OpenBookAPI";
import { useLibrary, LibraryBook } from "../contexts/LibraryContext";
import { useOpenBookAPI } from "../contexts/OpenBookAPI";
import SearchIcon from "@mui/icons-material/Search";

const SearchBooks = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<OpenBookAPIBook | null>(
    null,
  );
  const { addBooks } = useLibrary();
  // Setup React Query to fetch books from Open Library
  const { data, isLoading, isError, error } = useOpenBookAPI(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchTerm);
  };

  const handleCardClick = (book: OpenBookAPIBook) => {
    setSelectedBook(book);
  };

  const handleClose = () => {
    setSelectedBook(null);
  };

  const handleAddToLibrary = () => {
    if (selectedBook) {
      const newLibraryBook: LibraryBook = {
        isbn: selectedBook.key,
        title: selectedBook.title,
        author: selectedBook.author_name?.join(", "),
        cover_i: selectedBook.cover_i?.toString(),
        published: selectedBook.first_publish_year?.toString(),
        status: "unread",
      };
      addBooks([newLibraryBook]);
      handleClose();
    }
  };
  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              label="Search for books"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!searchTerm}
            >
              Search
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {isError && (
        <Box sx={{ my: 2, p: 2, bgcolor: "error.light", borderRadius: 1 }}>
          <Typography color="error.dark">
            Error: {(error as Error).message}
          </Typography>
        </Box>
      )}

      {/* Results */}
      {data && data.docs && (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">{data.numFound} results found</Typography>
          </Box>

          <Grid container spacing={3}>
            {data.docs.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.key}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={() => handleCardClick(book)}
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
                    {book.author_name && (
                      <Typography variant="body2" color="text.secondary">
                        By {book.author_name.join(", ")}
                      </Typography>
                    )}
                    {book.first_publish_year && (
                      <Typography variant="body2" color="text.secondary">
                        Published: {book.first_publish_year}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      <Dialog open={!!selectedBook} onClose={handleClose}>
        <DialogTitle>Book Information</DialogTitle>
        <DialogContent>
          {selectedBook && (
            <>
              <Typography variant="h6">{selectedBook.title}</Typography>
              {selectedBook.author_name && (
                <Typography variant="body2">
                  By {selectedBook.author_name.join(", ")}
                </Typography>
              )}
              {selectedBook.first_publish_year && (
                <Typography variant="body2">
                  Published: {selectedBook.first_publish_year}
                </Typography>
              )}
              {selectedBook.publisher && (
                <Typography variant="body2">
                  Publisher: {selectedBook.publisher.join(", ")}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddToLibrary} color="primary">
            Add to Library
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SearchBooks;
