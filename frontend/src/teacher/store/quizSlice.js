import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quizAPI from '../api/quizApi';

export const generateAIQuiz = createAsyncThunk(
  'quiz/generateAIQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await quizAPI.generateAIQuiz(quizData);
      return response.data.quiz;
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
      return response.data.quizzes;
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
      return response.data.quiz;
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
      return response.data.quiz;
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
      return response.data.results;
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
      return response.data.leaderboard;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quiz/deleteQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      await quizAPI.deleteQuiz(quizId);
      return quizId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quiz');
    }
  }
);

const initialState = {
  quizzes: [],
  currentQuiz: null,
  quizResults: [],
  leaderboard: [],
  loading: false,
  error: null,
  successMessage: '',
};

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
        state.currentQuiz = action.payload;
        state.successMessage = 'Quiz generated successfully';
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
        state.quizzes = action.payload;
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
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Assign Quiz
    builder
      .addCase(assignQuizToStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignQuizToStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
        state.successMessage = 'Quiz assigned successfully';
      })
      .addCase(assignQuizToStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Results
    builder
      .addCase(fetchQuizResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizResults.fulfilled, (state, action) => {
        state.loading = false;
        state.quizResults = action.payload;
      })
      .addCase(fetchQuizResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Leaderboard
    builder
      .addCase(fetchQuizLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload;
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
        state.quizzes = state.quizzes.filter((q) => q._id !== action.payload);
        state.successMessage = 'Quiz deleted successfully';
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = quizSlice.actions;
export default quizSlice.reducer;
