import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  ArrowForward,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import { getDashboardData } from '../api/dashboardApi';
import { useNavigate } from 'react-router-dom';

// ── Constants & Helpers ─────────────────────────────────────────────────────────

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    value
  );

const PIE_COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
];

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

const hoverCardSx = (glowColor) => ({
  ...glassCardSx,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-6px)',
    border: `1px solid ${glowColor}50`,
    boxShadow: `0 20px 40px -15px ${glowColor}25, 0 8px 32px 0 rgba(0, 0, 0, 0.47)`,
    '& .glow-icon-bg': {
      background: `${glowColor}25`,
      transform: 'scale(1.1) rotate(5deg)',
    },
  },
});

const STAT_CARDS_CONFIG = [
  {
    key: 'totalIncome',
    label: 'Total Income',
    color: '#10b981',
    icon: TrendingUp,
  },
  {
    key: 'totalExpense',
    label: 'Total Expense',
    color: '#f43f5e',
    icon: TrendingDown,
  },
  {
    key: 'netBalance',
    label: 'Net Balance',
    color: '#6366f1',
    icon: AccountBalance,
  },
  {
    key: 'transactionCount',
    label: 'Transactions Logged',
    color: '#06b6d4',
    icon: Receipt,
    isCurrency: false,
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon: Icon, isCurrency = true }) {
  return (
    <Card sx={hoverCardSx(color)}>
      {/* Decorative top colored border */}
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${color}cc, ${color}22)` }} />
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: '24px !important' }}>
        <Box
          className="glow-icon-bg"
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}15`,
            transition: 'all 0.3s ease',
            flexShrink: 0,
            boxShadow: `inset 0 0 12px 0 ${color}20`,
          }}
        >
          <Icon sx={{ fontSize: 28, color }} />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(241, 245, 249, 0.55)',
              fontWeight: 500,
              fontSize: '0.85rem',
              letterSpacing: '0.02em',
              mb: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.75rem',
              letterSpacing: '-0.02em',
              fontFamily: isCurrency ? "'JetBrains Mono', 'Inter', monospace" : 'inherit',
            }}
          >
            {isCurrency ? formatCurrency(value ?? 0) : (value ?? 0)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function MonthlyAreaChart({ data }) {
  return (
    <Card sx={{ ...glassCardSx, height: '100%' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem' }}>
          Monthly Cash Flow Activity
        </Typography>
      </Box>
      <Box sx={{ p: 3, pt: 1 }}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="rgba(255, 255, 255, 0.35)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.35)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fontWeight: 500 }}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
                fontWeight: 600,
              }}
              itemStyle={{ color: '#ffffff' }}
              labelStyle={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: 4 }}
              formatter={(value) => [formatCurrency(value), '']}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingBottom: 20,
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              name="Income Flow"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#incomeGrad)"
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#0f172a' }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Expense Flow"
              stroke="#f43f5e"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#expenseGrad)"
              activeDot={{ r: 6, stroke: '#f43f5e', strokeWidth: 2, fill: '#0f172a' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}

function CategoryPieChart({ data }) {
  const hasData = data && data.length > 0;

  return (
    <Card sx={{ ...glassCardSx, height: '100%' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem' }}>
          Distribution by Category
        </Typography>
      </Box>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={105}
                innerRadius={65}
                paddingAngle={4}
                label={({ category, percent }) =>
                  `${category.charAt(0) + category.slice(1).toLowerCase()} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} style={{ outline: 'none' }} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
                }}
                formatter={(value) => [formatCurrency(value), 'Total Spent']}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.45)' }}>
              No categories mapped yet.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}

function RecentTransactionsTable({ transactions, onViewAll }) {
  return (
    <Card sx={glassCardSx}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem' }}>
          Recent Transactions
        </Typography>
        <Button
          size="small"
          endIcon={<ArrowForward />}
          onClick={onViewAll}
          sx={{
            color: '#818cf8',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.85rem',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
          }}
        >
          View Detailed Ledger
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(15, 23, 42, 0.25)' }}>
            <TableRow>
              {['Date', 'Description', 'Category', 'Amount', 'Type'].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    color: 'rgba(241, 245, 249, 0.45)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    px: 3,
                    py: 2,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => {
              const isIncome = tx.transactionType === 'INCOME';
              return (
                <TableRow
                  key={tx.id}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <TableCell
                    sx={{
                      color: 'rgba(241, 245, 249, 0.75)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      px: 3,
                      fontSize: '0.85rem',
                    }}
                  >
                    {tx.transactionDate}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#ffffff',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      px: 3,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
                      {tx.title}
                    </Typography>
                    {tx.description && (
                      <Typography variant="caption" sx={{ color: 'rgba(241, 245, 249, 0.4)', display: 'block', mt: 0.25 }}>
                        {tx.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', px: 3 }}>
                    <Chip
                      label={tx.category}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(99, 102, 241, 0.12)',
                        color: '#a5b4fc',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      color: isIncome ? '#10b981' : '#f43f5e',
                      fontWeight: 700,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.9rem',
                      px: 3,
                    }}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', px: 3 }}>
                    <Chip
                      label={tx.transactionType}
                      size="small"
                      sx={{
                        backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                        color: isIncome ? '#34d399' : '#fb7185',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        borderRadius: '6px',
                        border: isIncome ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)',
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    textAlign: 'center',
                    py: 6,
                    borderBottom: 'none',
                  }}
                >
                  No recent transaction records discovered.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton
              variant="rounded"
              height={120}
              sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '20px' }}
            />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Skeleton
            variant="rounded"
            height={400}
            sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '20px' }}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <Skeleton
            variant="rounded"
            height={400}
            sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '20px' }}
          />
        </Grid>
      </Grid>
      <Skeleton
        variant="rounded"
        height={300}
        sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '20px' }}
      />
    </Box>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await getDashboardData();
        setData(res.data.data);
      } catch (err) {
        setError(true);
        toast.error(err?.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          Unable to establish safe connection to fetch dashboard.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{
            borderColor: '#6366f1',
            color: '#818cf8',
            '&:hover': { borderColor: '#4f46e5', backgroundColor: 'rgba(99, 102, 241, 0.08)' },
          }}
        >
          Retry Connection
        </Button>
      </Box>
    );
  }

  const {
    totalIncome = 0,
    totalExpense = 0,
    currentBalance = 0,
    recentTransactions = [],
    monthlySummary = [],
    categoryExpenses = [],
  } = data;

  // Format monthNames in monthlySummary for the AreaChart (e.g. "JANUARY" -> "Jan")
  const monthlyData = monthlySummary.map((item) => ({
    ...item,
    month: item.monthName ? item.monthName.charAt(0) + item.monthName.slice(1, 3).toLowerCase() : '',
  }));

  const categoryBreakdown = categoryExpenses;

  const statValues = {
    totalIncome,
    totalExpense,
    netBalance: currentBalance,
    transactionCount: recentTransactions.length,
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
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.07) 0%, rgba(99, 102, 241, 0) 70%)',
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

      {/* ── Page Header ── */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#ffffff',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            mb: 0.5,
            background: 'linear-gradient(90deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Financial Intelligence
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'rgba(241, 245, 249, 0.45)', fontWeight: 500, fontSize: '0.9rem' }}
        >
          Real-time metrics, cash flow graphs, and recent financial actions.
        </Typography>
      </Box>

      {/* ── Stats Cards ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STAT_CARDS_CONFIG.map((cfg) => (
          <Grid item xs={12} sm={6} md={3} key={cfg.key}>
            <StatCard
              label={cfg.label}
              value={statValues[cfg.key]}
              color={cfg.color}
              icon={cfg.icon}
              isCurrency={cfg.isCurrency !== false}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Charts ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <MonthlyAreaChart data={monthlyData} />
        </Grid>
        <Grid item xs={12} md={5}>
          <CategoryPieChart data={categoryBreakdown} />
        </Grid>
      </Grid>

      {/* ── Recent Transactions ── */}
      <RecentTransactionsTable
        transactions={recentTransactions}
        onViewAll={() => navigate('/transactions')}
      />
    </Box>
  );
}
