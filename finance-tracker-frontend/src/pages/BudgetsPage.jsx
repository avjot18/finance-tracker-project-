import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Skeleton, CardHeader, Avatar
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import FoodBankIcon from '@mui/icons-material/FoodBank'
import HomeIcon from '@mui/icons-material/Home'
import BoltIcon from '@mui/icons-material/Bolt'
import CommuteIcon from '@mui/icons-material/Commute'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import SchoolIcon from '@mui/icons-material/School'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import WorkIcon from '@mui/icons-material/Work'
import StarsIcon from '@mui/icons-material/Stars'
import CategoryIcon from '@mui/icons-material/Category'
import { useForm, Controller } from 'react-hook-form'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgetApi'
import toast from 'react-hot-toast'

// ── Constants & Styling ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'SALARY', label: 'Salary', icon: <WorkIcon /> },
  { value: 'FREELANCE', label: 'Freelance', icon: <StarsIcon /> },
  { value: 'INVESTMENT', label: 'Investment', icon: <AccountBalanceIcon /> },
  { value: 'FOOD', label: 'Food', icon: <FoodBankIcon /> },
  { value: 'RENT', label: 'Rent', icon: <HomeIcon /> },
  { value: 'UTILITIES', label: 'Utilities', icon: <BoltIcon /> },
  { value: 'TRANSPORTATION', label: 'Transportation', icon: <CommuteIcon /> },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: <SportsEsportsIcon /> },
  { value: 'HEALTHCARE', label: 'Healthcare', icon: <LocalHospitalIcon /> },
  { value: 'SHOPPING', label: 'Shopping', icon: <ShoppingBagIcon /> },
  { value: 'EDUCATION', label: 'Education', icon: <SchoolIcon /> },
  { value: 'OTHER', label: 'Other', icon: <CategoryIcon /> }
]

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
]

const glassCardSx = {
  background: 'rgba(30, 41, 59, 0.45)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  borderRadius: '20px',
  overflow: 'visible',
  position: 'relative',
};

const hoverBudgetCardSx = (glowColor) => ({
  ...glassCardSx,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    border: `1px solid ${glowColor}50`,
    boxShadow: `0 15px 35px -10px ${glowColor}20, 0 8px 32px 0 rgba(0, 0, 0, 0.37)`,
  }
});

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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

const getCategoryIcon = (category) => {
  const match = CATEGORIES.find(c => c.value === category)
  return match ? match.icon : <CategoryIcon />
}

// ── Component ──────────────────────────────────────────────────────────────────

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editBudget, setEditBudget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      category: '',
      monthlyLimit: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
  })

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getBudgets()
      setBudgets(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const handleOpenAdd = () => {
    setEditBudget(null)
    reset({
      category: '',
      monthlyLimit: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    })
    setDialogOpen(true)
  }

  const handleOpenEdit = (budget) => {
    setEditBudget(budget)
    setValue('category', budget.category)
    setValue('monthlyLimit', budget.monthlyLimit)
    setValue('month', budget.month)
    setValue('year', budget.year)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditBudget(null)
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        monthlyLimit: parseFloat(data.monthlyLimit),
        month: parseInt(data.month),
        year: parseInt(data.year),
      }
      if (editBudget) {
        await updateBudget(editBudget.id, payload)
        toast.success('Budget updated successfully')
      } else {
        await createBudget(payload)
        toast.success('Budget created successfully')
      }
      handleCloseDialog()
      fetchBudgets()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving budget')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteBudget(deleteTarget.id)
      toast.success('Budget deleted successfully')
      setDeleteTarget(null)
      fetchBudgets()
    } catch (err) {
      toast.error('Failed to delete budget')
    }
  }

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
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 70%)',
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
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, rgba(6, 182, 212, 0) 70%)',
          filter: 'blur(80px)',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
            Budget Planners
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(241, 245, 249, 0.45)', fontWeight: 500 }}>
            Establish monthly limits by category and track real-time consumption.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
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
          Add Budget
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Card sx={{ ...glassCardSx, height: 190 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                      <Skeleton variant="text" width="40%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" sx={{ mt: 3, bgcolor: 'rgba(255,255,255,0.05)' }} />
                  <Skeleton variant="text" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.05)' }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : budgets.length === 0 ? (
        <Card
          sx={{
            ...glassCardSx,
            textAlign: 'center',
            py: 8,
            px: 3,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: 'rgba(99, 102, 241, 0.3)',
            backgroundColor: 'rgba(30, 41, 59, 0.2)',
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, mb: 1 }}>
              No budget quotas found.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.25)', mb: 4 }}>
              Set spending limits to monitor warnings when transactions approach thresholds.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{
                borderColor: '#6366f1',
                color: '#818cf8',
                borderRadius: '12px',
                px: 3,
                fontWeight: 650,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#4f46e5',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                },
              }}
            >
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {budgets.map((budget) => {
            const pct = budget.monthlyLimit > 0 ? (budget.spentAmount / budget.monthlyLimit) * 100 : 0
            const progressColor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981'
            const progressColorName = pct > 90 ? 'error' : pct > 70 ? 'warning' : 'success'
            const remaining = budget.monthlyLimit - budget.spentAmount

            return (
              <Grid item xs={12} sm={6} md={4} key={budget.id}>
                <Card sx={hoverBudgetCardSx(progressColor)}>
                  <CardHeader
                    avatar={
                      <Avatar
                        sx={{
                          bgcolor: `${progressColor}15`,
                          color: progressColor,
                          border: `1px solid ${progressColor}35`,
                          boxShadow: `0 0 10px ${progressColor}20`,
                          width: 46,
                          height: 46
                        }}
                      >
                        {getCategoryIcon(budget.category)}
                      </Avatar>
                    }
                    action={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(budget)}
                          sx={{
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.15)',
                            backgroundColor: 'rgba(99, 102, 241, 0.03)',
                            borderRadius: '8px',
                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' },
                            transition: 'all 0.2s',
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget(budget)}
                          sx={{
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.15)',
                            backgroundColor: 'rgba(239, 68, 68, 0.03)',
                            borderRadius: '8px',
                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' },
                            transition: 'all 0.2s',
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    title={budget.category.charAt(0) + budget.category.slice(1).toLowerCase()}
                    subheader={`${MONTHS.find(m => m.value === budget.month)?.label} ${budget.year}`}
                    titleTypographyProps={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}
                    subheaderTypographyProps={{ color: 'rgba(241, 245, 249, 0.45)', fontSize: '0.8rem', fontWeight: 500 }}
                  />
                  <CardContent sx={{ pt: 1, px: 3, pb: '24px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(241, 245, 249, 0.55)', fontSize: '0.85rem' }}>Spent Balance</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem', fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatCurrency(budget.spentAmount)} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/</span> {formatCurrency(budget.monthlyLimit)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(pct, 100)}
                        color={progressColorName}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            boxShadow: `0 0 10px ${progressColor}60`
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: progressColor,
                          fontWeight: 700,
                          backgroundColor: `${progressColor}12`,
                          px: 1,
                          py: 0.25,
                          borderRadius: '4px',
                        }}
                      >
                        {pct.toFixed(0)}% Utilized
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: remaining < 0 ? '#f43f5e' : '#10b981',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {remaining < 0 ? `${formatCurrency(Math.abs(remaining))} over quota` : `${formatCurrency(remaining)} remaining`}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* ===================== ADD / EDIT DIALOG ===================== */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
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
            {editBudget ? 'Update Budget Plan' : 'Establish Budget Plan'}
          </DialogTitle>
          
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, px: 4, py: 4 }}>
            <FormControl fullWidth size="small" sx={glassInputSx}>
              <InputLabel id="category-label">Category</InputLabel>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category designation is required' }}
                render={({ field, fieldState }) => (
                  <>
                    <Select
                      labelId="category-label"
                      label="Category"
                      {...field}
                      error={!!fieldState.error}
                    >
                      {CATEGORIES.map((c) => (
                        <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                      ))}
                    </Select>
                    {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
                  </>
                )}
              />
            </FormControl>

            <Controller
              name="monthlyLimit"
              control={control}
              rules={{ required: 'Limit boundary is required', min: { value: 0.01, message: 'Limit must exceed 0.00' } }}
              render={({ field, fieldState }) => (
                <TextField
                  label="Monthly Limit (INR)"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={glassInputSx}
                  {...field}
                />
              )}
            />

            <FormControl fullWidth size="small" sx={glassInputSx}>
              <InputLabel id="month-label">Month</InputLabel>
              <Controller
                name="month"
                control={control}
                rules={{ required: 'Target month is required' }}
                render={({ field, fieldState }) => (
                  <>
                    <Select
                      labelId="month-label"
                      label="Month"
                      {...field}
                      error={!!fieldState.error}
                    >
                      {MONTHS.map((m) => (
                        <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                      ))}
                    </Select>
                    {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
                  </>
                )}
              />
            </FormControl>

            <Controller
              name="year"
              control={control}
              rules={{ required: 'Target year is required', min: { value: 2000, message: 'Year must be after 1999' } }}
              render={({ field, fieldState }) => (
                <TextField
                  label="Year"
                  type="number"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={glassInputSx}
                  {...field}
                />
              )}
            />
          </DialogContent>
          
          <DialogActions sx={{ px: 4, py: 3, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Button
              onClick={handleCloseDialog}
              sx={{ color: 'rgba(255, 255, 255, 0.55)', textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
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
              Confirm Budget
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ===================== DELETE CONFIRMATION DIALOG ===================== */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={{ color: '#ffffff', fontWeight: 850, pt: 3, px: 4 }}>
          Permanently Expunge Budget?
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 1 }}>
          <Typography sx={{ color: 'rgba(241, 245, 249, 0.6)', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete the budget limit set for category{' '}
            <strong style={{ color: '#ffffff' }}>
              {deleteTarget?.category.charAt(0) + deleteTarget?.category.slice(1).toLowerCase()}
            </strong>
            ? This limits reporting warning flags for transactions in this scope.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 4, py: 3 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{ color: 'rgba(255, 255, 255, 0.55)', textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
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
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BudgetsPage
