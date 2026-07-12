import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  Stack,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../api/transactionApi';

// ── Constants & Styling ─────────────────────────────────────────────────────────

const CATEGORIES = [
  'SALARY',
  'FREELANCE',
  'INVESTMENT',
  'FOOD',
  'RENT',
  'UTILITIES',
  'TRANSPORTATION',
  'ENTERTAINMENT',
  'HEALTHCARE',
  'SHOPPING',
  'EDUCATION',
  'OTHER',
];

const TYPES = ['INCOME', 'EXPENSE'];

const SORT_OPTIONS = [
  { value: 'transactionDate', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' },
];

const CATEGORY_COLORS = {
  SALARY: '#10b981',      // Emerald
  FREELANCE: '#06b6d4',   // Cyan
  INVESTMENT: '#3b82f6',  // Blue
  FOOD: '#f97316',        // Orange
  RENT: '#ef4444',        // Red
  UTILITIES: '#eab308',   // Yellow
  TRANSPORTATION: '#8b5cf6', // Violet
  ENTERTAINMENT: '#ec4899', // Pink
  HEALTHCARE: '#14b8a6',  // Teal
  SHOPPING: '#f43f5e',    // Rose
  EDUCATION: '#6366f1',   // Indigo
  OTHER: '#94a3b8',       // Slate
};

const glassCardSx = {
  background: 'rgba(30, 41, 59, 0.45)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
};

const glassInputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    borderRadius: '12px',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.08)',
      transition: 'border-color 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(99, 102, 241, 0.45)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6366f1',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(241, 245, 249, 0.5)',
    fontSize: '0.9rem',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#818cf8',
  },
};

const dialogPaperSx = {
  background: 'rgba(30, 41, 59, 0.75)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
  borderRadius: '24px',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    amount
  );

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ── Component ──────────────────────────────────────────────────────────────────

const TransactionsPage = () => {
  // ---- state ----
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('transactionDate');
  const [sortDir, setSortDir] = useState('desc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' | 'edit'
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---- react-hook-form ----
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      transactionType: 'EXPENSE',
      category: 'FOOD',
      amount: '',
      title: '',
      description: '',
      transactionDate: new Date().toISOString().slice(0, 10),
    },
  });

  // ---- fetch ----
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNo: page,
        pageSize: rowsPerPage,
        sortBy,
        sortDir,
      };
      if (filterType !== 'ALL') params.type = filterType;
      if (filterCategory !== 'ALL') params.category = filterCategory;

      const res = await getTransactions(params);
      const data = res.data.data;
      setTransactions(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterType, filterCategory, sortBy, sortDir]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [filterType, filterCategory, sortBy, sortDir]);

  // ---- dialog helpers ----
  const openAddDialog = () => {
    setDialogMode('add');
    setEditingTransaction(null);
    reset({
      transactionType: 'EXPENSE',
      category: 'FOOD',
      amount: '',
      title: '',
      description: '',
      transactionDate: new Date().toISOString().slice(0, 10),
    });
    setDialogOpen(true);
  };

  const openEditDialog = (txn) => {
    setDialogMode('edit');
    setEditingTransaction(txn);
    reset({
      transactionType: txn.transactionType,
      category: txn.category,
      amount: txn.amount,
      title: txn.title,
      description: txn.description || '',
      transactionDate: txn.transactionDate,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
  };

  // ---- CRUD ----
  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        transactionType: formData.transactionType,
        category: formData.category,
        transactionDate: formData.transactionDate,
      };

      if (dialogMode === 'add') {
        await createTransaction(payload);
        toast.success('Transaction created');
      } else {
        await updateTransaction(editingTransaction.id, payload);
        toast.success('Transaction updated');
      }
      closeDialog();
      fetchTransactions();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${dialogMode === 'add' ? 'create' : 'update'} transaction`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (txn) => {
    setDeleteTarget(txn);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteTransaction(deleteTarget.id);
      toast.success('Transaction deleted');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto', zIndex: 1 }}>
      {/* ── Background Glow Elements ── */}
      <Box
        sx={{
          position: 'fixed',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(80px)',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.03) 0%, rgba(239, 68, 68, 0) 70%)',
          filter: 'blur(80px)',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      {/* ===================== HEADER ===================== */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={4}
        gap={2}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(90deg, #ffffff 0%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Transaction Ledger
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(241, 245, 249, 0.45)', fontWeight: 500 }}>
            Audit, track, and filter your historical transactions logs.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.45)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              boxShadow: '0 6px 24px rgba(99, 102, 241, 0.6)',
            },
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '12px',
            px: 4,
            py: 1.5,
          }}
        >
          New Transaction
        </Button>
      </Stack>

      {/* ===================== FILTER BAR ===================== */}
      <Card sx={{ ...glassCardSx, mb: 4 }}>
        <CardContent sx={{ p: '24px !important' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={2.5}
            alignItems={{ sm: 'center' }}
            flexWrap="wrap"
          >
            {/* Type filter */}
            <FormControl size="small" sx={{ minWidth: 150, ...glassInputSx }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="ALL">All Flow Types</MenuItem>
                {TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Category filter */}
            <FormControl size="small" sx={{ minWidth: 180, ...glassInputSx }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort by */}
            <FormControl size="small" sx={{ minWidth: 160, ...glassInputSx }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort direction toggle */}
            <IconButton
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              sx={{
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                borderRadius: '12px',
                p: '10px',
                '&:hover': {
                  bgcolor: 'rgba(99, 102, 241, 0.15)',
                  borderColor: '#6366f1',
                },
                transition: 'all 0.2s ease',
              }}
              title={sortDir === 'asc' ? 'Ascending Order' : 'Descending Order'}
            >
              {sortDir === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================== TABLE ===================== */}
      <Card sx={glassCardSx}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 350,
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: '#6366f1' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
              Decrypting transaction records...
            </Typography>
          </Box>
        ) : transactions.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 350,
              gap: 1,
            }}
          >
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              Zero records match search scope.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.2)' }}>
              Try adjusting your filter sets or create a new transaction entry.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'rgba(15, 23, 42, 0.25)' }}>
                  <TableRow>
                    {['Date', 'Title', 'Description', 'Category', 'Amount', 'Actions'].map(
                      (h) => (
                        <TableCell
                          key={h}
                          sx={{
                            color: 'rgba(241, 245, 249, 0.45)',
                            fontWeight: 700,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            px: 3,
                            py: 2.5,
                          }}
                        >
                          {h}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow
                      key={txn.id}
                      sx={{
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <TableCell
                        sx={{
                          color: 'rgba(241, 245, 249, 0.75)',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          whiteSpace: 'nowrap',
                          px: 3,
                          fontSize: '0.85rem',
                        }}
                      >
                        {formatDate(txn.transactionDate)}
                      </TableCell>

                      <TableCell
                        sx={{
                          color: '#ffffff',
                          fontWeight: 600,
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          maxWidth: 180,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          px: 3,
                          fontSize: '0.85rem',
                        }}
                      >
                        {txn.title}
                      </TableCell>

                      <TableCell
                        sx={{
                          color: 'rgba(241, 245, 249, 0.45)',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          maxWidth: 250,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          px: 3,
                          fontSize: '0.85rem',
                        }}
                      >
                        {txn.description || '—'}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          px: 3,
                        }}
                      >
                        <Chip
                          label={txn.category}
                          size="small"
                          sx={{
                            bgcolor: `${CATEGORY_COLORS[txn.category] || '#94a3b8'}15`,
                            color: CATEGORY_COLORS[txn.category] || '#94a3b8',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            borderRadius: '6px',
                            border: `1px solid ${CATEGORY_COLORS[txn.category] || '#94a3b8'}25`,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: txn.transactionType === 'INCOME' ? '#10b981' : '#f43f5e',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          whiteSpace: 'nowrap',
                          px: 3,
                          fontSize: '0.9rem',
                        }}
                      >
                        {txn.transactionType === 'INCOME' ? '+' : '−'}
                        {formatCurrency(txn.amount)}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          whiteSpace: 'nowrap',
                          px: 3,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(txn)}
                          sx={{
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.15)',
                            bgcolor: 'rgba(99, 102, 241, 0.03)',
                            borderRadius: '8px',
                            '&:hover': {
                              bgcolor: 'rgba(99, 102, 241, 0.15)',
                              color: '#6366f1',
                            },
                            mr: 1,
                            transition: 'all 0.2s',
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(txn)}
                          sx={{
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.15)',
                            bgcolor: 'rgba(239, 68, 68, 0.03)',
                            borderRadius: '8px',
                            '&:hover': {
                              bgcolor: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                            },
                            transition: 'all 0.2s',
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                color: 'rgba(241, 245, 249, 0.55)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(15, 23, 42, 0.1)',
                fontWeight: 500,
                '& .MuiTablePagination-selectIcon': { color: 'rgba(241, 245, 249, 0.55)' },
                '& .MuiIconButton-root': { color: 'rgba(241, 245, 249, 0.55)' },
                '& .MuiIconButton-root.Mui-disabled': { color: 'rgba(255,255,255,0.08)' },
              }}
            />
          </>
        )}
      </Card>

      {/* ===================== ADD / EDIT DIALOG ===================== */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle
          sx={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            px: 4,
            py: 3,
          }}
        >
          {dialogMode === 'add' ? 'Create Transaction' : 'Update Transaction Record'}
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, px: 4, py: 4 }}>
            {/* Type */}
            <Controller
              name="transactionType"
              control={control}
              rules={{ required: 'Transaction flow type is required' }}
              render={({ field }) => (
                <FormControl fullWidth size="small" sx={glassInputSx} error={!!errors.transactionType}>
                  <InputLabel>Flow Type</InputLabel>
                  <Select {...field} label="Flow Type">
                    {TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.transactionType && (
                    <FormHelperText error>{errors.transactionType.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Category */}
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category designation is required' }}
              render={({ field }) => (
                <FormControl fullWidth size="small" sx={glassInputSx} error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select {...field} label="Category">
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c.charAt(0) + c.slice(1).toLowerCase()}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <FormHelperText error>{errors.category.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Amount */}
            <Controller
              name="amount"
              control={control}
              rules={{
                required: 'Amount field is required',
                validate: (v) => parseFloat(v) > 0 || 'Amount must exceed 0.00',
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Amount (INR)"
                  type="number"
                  size="small"
                  fullWidth
                  inputProps={{ step: '0.01', min: '0.01' }}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  sx={glassInputSx}
                />
              )}
            />

            {/* Title */}
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title reference is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title Reference"
                  size="small"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={glassInputSx}
                />
              )}
            />

            {/* Date */}
            <Controller
              name="transactionDate"
              control={control}
              rules={{ required: 'Transaction date is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Transaction Date"
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.transactionDate}
                  helperText={errors.transactionDate?.message}
                  sx={glassInputSx}
                />
              )}
            />

            {/* Description (Optional notes) */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description Details (optional)"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  sx={glassInputSx}
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ px: 4, py: 3, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Button
              onClick={closeDialog}
              sx={{ color: 'rgba(255, 255, 255, 0.55)', textTransform: 'none', fontWeight: 600 }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                },
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                px: 4,
              }}
            >
              {submitting
                ? dialogMode === 'add'
                  ? 'Adding Flow…'
                  : 'Updating Ledger…'
                : dialogMode === 'add'
                  ? 'Confirm Addition'
                  : 'Commit Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ===================== DELETE CONFIRMATION DIALOG ===================== */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={{ color: '#ffffff', fontWeight: 850, pt: 3, px: 4 }}>
          Permanently Expunge Record?
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 1 }}>
          <Typography sx={{ color: 'rgba(241, 245, 249, 0.6)', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete transaction{' '}
            <Box component="span" sx={{ color: '#ffffff', fontWeight: 700 }}>
              "{deleteTarget?.title || deleteTarget?.description}"
            </Box>
            ? This process runs synchronously and cannot be rolled back.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 4, py: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.55)', textTransform: 'none', fontWeight: 600 }}
            disabled={submitting}
          >
            Abort Action
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: '#ef4444',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
              '&:hover': { bgcolor: '#dc2626' },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 4,
            }}
          >
            {submitting ? 'Expunging…' : 'Delete Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;
