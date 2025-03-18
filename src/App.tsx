import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia,
  Grid, 
  CircularProgress,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import './App.css'
import LibraryUpload from './components/LibraryUpload'
import { useLibrary, LibraryBook } from './contexts/LibraryContext'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


// Type definitions for the Open Library API response
interface Book {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  publisher?: string[];
}

interface SearchResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: Book[];
}

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [activeTab, setActiveTab] = useState<number>(0)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { books, addBooks } = useLibrary()

  // Setup React Query to fetch books from Open Library
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['books', query],
    queryFn: async () => {
      if (!query) return { numFound: 0, start: 0, numFoundExact: false, docs: [] } as SearchResponse;
      
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json() as Promise<SearchResponse>;
    },
    enabled: !!query, // Only run the query if there's a search term
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchTerm);
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCardClick = (book: Book) => {
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
        author: selectedBook.author_name?.join(', '),
        cover_i: selectedBook.cover_i?.toString(),
        published: selectedBook.first_publish_year?.toString(),
        status: 'unread',
      };
      addBooks([newLibraryBook]);
      handleClose();
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Open Book Search
      </Typography>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        centered
        sx={{ mb: 3 }}
      >
        <Tab label="Search" />
        <Tab label="My Library" />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <form onSubmit={handleSearch}>
              <Box sx={{ display: 'flex', gap: 1 }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error state */}
          {isError && (
            <Box sx={{ my: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography color="error.dark">
                Error: {(error as Error).message}
              </Typography>
            </Box>
          )}

          {/* Results */}
          {data && data.docs && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {data.numFound} results found
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {data.docs.map((book) => (
                  <Grid item xs={12} sm={6} md={4} key={book.key}>
                    <Card 
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                      onClick={() => handleCardClick(book)}
                    >
                      {book.cover_i && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                          alt={book.title}
                          sx={{ objectFit: 'contain', pt: 2 }}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="h2" noWrap>
                          {book.title}
                        </Typography>
                        {book.author_name && (
                          <Typography variant="body2" color="text.secondary">
                            By {book.author_name.join(', ')}
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
        </>
      )}

      {activeTab === 1 && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <LibraryUpload />
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              My Library ({books.length} books)
            </Typography>
            
            {books.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
                Your library is empty. Please upload a CSV file to import your books.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {books.map((book: LibraryBook, index) => (
                  <Grid item xs={12} sm={6} md={4} key={book.isbn || index}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {book.cover_i && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                          alt={book.title}
                          sx={{ objectFit: 'contain', pt: 2 }}
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
                              fontWeight: 'bold',
                              color: book.status.toLowerCase() === 'read' ? 'success.main' : 
                                     book.status.toLowerCase() === 'reading' ? 'info.main' : 
                                     'text.secondary'
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
      )}
      <Dialog open={!!selectedBook} onClose={handleClose}>
        <DialogTitle>Book Information</DialogTitle>
        <DialogContent>
          {selectedBook && (
            <>
              <Typography variant="h6">{selectedBook.title}</Typography>
              {selectedBook.author_name && (
                <Typography variant="body2">By {selectedBook.author_name.join(', ')}</Typography>
              )}
              {selectedBook.first_publish_year && (
                <Typography variant="body2">Published: {selectedBook.first_publish_year}</Typography>
              )}
              {selectedBook.publisher && (
                <Typography variant="body2">Publisher: {selectedBook.publisher.join(', ')}</Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleAddToLibrary} color="primary">Add to Library</Button>
        </DialogActions>
      </Dialog>
    </Container>
    </ThemeProvider>
  )
}

export default App
