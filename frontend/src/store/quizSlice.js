import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as quizAPI from '../teacher/api/quizApi';

// Async Thunks
export const generateAIQuiz = createAsyncThunk(
  'quiz/generateAIQuiz',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await quizAPI.generateAIQuiz(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate quiz');
    }
  }
);

export const fetchTeacherQuizzes = createAsyncThunk(
  'quiz/fetchTeacherQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await quizAPI.getTeacherQuizzes();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
    }
  }
);

export const fetchQuizDetails = createAsyncThunk(
  'quiz/fetchQuizDetails',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await quizAPI.getQuizDetails(quizId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz details');
    }
  }
);

export const assignQuizToStudents = createAsyncThunk(
  'quiz/assignQuizToStudents',
  async ({ quizId, studentIds }, { rejectWithValue }) => {
    try {
      const response = await quizAPI.assignQuizToStudents(quizId, studentIds);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign quiz');
    }
  }
);

export const fetchQuizResults = createAsyncThunk(
  'quiz/fetchQuizResults',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await quizAPI.getQuizResults(quizId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
    }
  }
);

export const fetchQuizLeaderboard = createAsyncThunk(
  'quiz/fetchQuizLeaderboard',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await quizAPI.getQuizLeaderboard(quizId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quiz/deleteQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await quizAPI.deleteQuiz(quizId);
      return { quizId, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quiz');
    }
  }
);

// Initial State
const initialState = {
  quizzes: [],
  currentQuiz: null,
  quizResults: [],
  leaderboard: [],
  loading: false,
  error: null,
  successMessage: '',
};

// Slice
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = '';
    },
  },
  extraReducers: (builder) => {
    // Generate AI Quiz
    builder
      .addCase(generateAIQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateAIQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload.quiz;
        state.successMessage = action.payload.message || 'Quiz generated successfully!';
      })
      .addCase(generateAIQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Teacher Quizzes
    builder
      .addCase(fetchTeacherQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload.quizzes || action.payload;
      })
      .addCase(fetchTeacherQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Quiz Details
    builder
      .addCase(fetchQuizDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload.quiz || action.payload;
      })
      .addCase(fetchQuizDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Assign Quiz to Students
    builder
      .addCase(assignQuizToStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignQuizToStudents.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentQuiz) {
          state.currentQuiz.isPublished = true;
        }
        state.successMessage = action.payload.message || 'Quiz assigned successfully!';
      })
      .addCase(assignQuizToStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Quiz Results
    builder
      .addCase(fetchQuizResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizResults.fulfilled, (state, action) => {
        state.loading = false;
        state.quizResults = action.payload.results || action.payload;
      })
      .addCase(fetchQuizResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Quiz Leaderboard
    builder
      .addCase(fetchQuizLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload.leaderboard || action.payload;
      })
      .addCase(fetchQuizLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Quiz
    builder
      .addCase(deleteQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = state.quizzes.filter(q => q._id !== action.payload.quizId);
        state.successMessage = 'Quiz deleted successfully!';
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = quizSlice.actions;
export default quizSlice.reducer;
