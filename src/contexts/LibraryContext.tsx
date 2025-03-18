import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import Papa from "papaparse";

// Define types for our book data
export interface GoodReadsBook {
  "Book Id": string;
  Title: string;
  Author: string;
  "Author l-f": string;
  "Additional Authors": string;
  ISBN: string;
  ISBN13: string;
  "My Rating": string;
  "Average Rating": string;
  Publisher: string;
  Binding: string;
  "Number of Pages": string;
  "Year Published": string;
  "Original Publication Year": string;
  "Date Read": string;
  "Date Added": string;
  Bookshelves: string;
  "Bookshelves with positions": string;
  "Exclusive Shelf": string;
  "My Review": string;
  Spoiler: string;
  "Private Notes": string;
  "Read Count": string;
  "Owned Copies": string;
}

export interface LibraryBook {
  isbn: string;
  author?: string;
  title?: string;
  cover_i?: string;
  published?: string;
  status?: string;
  rating?: string;
  dateRead?: string;
  dateAdded?: string;
  review?: string;
}

interface LibraryContextType {
  books: LibraryBook[];
  loading: boolean;
  error: string | null;
  addBooks: (books: LibraryBook[]) => void;
  uploadCSV: (file: File) => Promise<void>;
  clearLibrary: () => void;
}

// Create the context with default values
export const LibraryContext = createContext<LibraryContextType>({
  books: [],
  loading: false,
  error: null,
  addBooks: () => {},
  uploadCSV: async () => {},
  clearLibrary: () => {},
});

// Custom hook to use the library context
export const useLibrary = () => useContext(LibraryContext);

interface LibraryProviderProps {
  children: ReactNode;
}

// The storage key for our library data
const STORAGE_KEY = "library_data";

export const LibraryProvider = ({ children }: LibraryProviderProps) => {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const loadLibraryFromStorage = () => {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          setBooks(JSON.parse(storedData));
        }
      } catch (err) {
        setError("Failed to load library from storage");
        console.error("Error loading library data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLibraryFromStorage();
  }, []);

  // Save to localStorage whenever books change
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }
  }, [books]);

  // Add books to the library
  const addBooks = (newBooks: LibraryBook[]) => {
    setBooks((prevBooks) => {
      // Create a map of existing books by ID or title+author for deduplication
      const existingBooks = new Map(
        prevBooks.map((book) => [
          book.isbn || `${book.title}-${book.author}`,
          book,
        ]),
      );

      // Only add books that don't already exist
      newBooks.forEach((book) => {
        const bookId = book.isbn || `${book.title}-${book.author}`;
        if (!existingBooks.has(bookId)) {
          existingBooks.set(bookId, book);
        }
      });

      return Array.from(existingBooks.values());
    });
  };

  const convertGoodReads = (newBooks: GoodReadsBook[]): LibraryBook[] => {
    return newBooks.map((newBook: GoodReadsBook): LibraryBook => {
      const status =
        newBook["Date Read"] || parseInt(newBook["Read Count"]) > 0
          ? "read"
          : "unread";
      return {
        title: newBook.Title,
        author: newBook.Author,
        isbn: newBook.ISBN13 || newBook.ISBN,
        published:
          newBook["Original Publication Year"] || newBook["Year Published"],
        status: status,
        rating: newBook["My Rating"],
        dateRead: newBook["Date Read"],
        dateAdded: newBook["Date Added"],
        review: newBook["My Review"],
      };
    });
  };

  // Parse and upload a CSV file
  const uploadCSV = async (file: File): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      return new Promise((resolve, reject) => {
        Papa.parse<GoodReadsBook>(file, {
          header: true,
          complete: (results: Papa.ParseResult<GoodReadsBook>) => {
            const parsedBooks = results.data;
            addBooks(convertGoodReads(parsedBooks));
            setLoading(false);
            resolve();
          },
          error: (error: Error) => {
            setError(`Failed to parse CSV: ${error.message}`);
            setLoading(false);
            reject(error);
          },
        });
      });
    } catch (err) {
      setError("Failed to process CSV file");
      setLoading(false);
      throw err;
    }
  };

  // Clear the library
  const clearLibrary = () => {
    setBooks([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        loading,
        error,
        addBooks,
        uploadCSV,
        clearLibrary,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
