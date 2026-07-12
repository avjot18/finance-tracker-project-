import React, { useState, useEffect } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Button, CircularProgress,
  Divider, Skeleton
} from '@mui/material'
import TableChartIcon from '@mui/icons-material/TableChart'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { downloadCsvReport, downloadPdfReport, getDashboardData } from '../api/dashboardApi'
import toast from 'react-hot-toast'

// ── Constants & Styling ─────────────────────────────────────────────────────────

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount || 0)
}

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

const hoverExportCardSx = (glowColor) => ({
  ...glassCardSx,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-6px)',
    border: `1px solid ${glowColor}50`,
    boxShadow: `0 20px 40px -15px ${glowColor}25, 0 8px 32px 0 rgba(0, 0, 0, 0.37)`,
    '& .glow-icon-wrap': {
      background: `${glowColor}25`,
      transform: 'scale(1.1) rotate(6deg)',
      boxShadow: `0 0 20px ${glowColor}40`,
    }
  }
});

// ── Component ──────────────────────────────────────────────────────────────────

const ReportsPage = () => {
  const [csvLoading, setCsvLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getDashboardData()
        setSummaryData(res.data.data)
      } catch (err) {
        toast.error('Failed to load financial summary data')
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleCsvDownload = async () => {
    setCsvLoading(true)
    try {
      const res = await downloadCsvReport()
      triggerDownload(res.data, `finance_report_${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('CSV Report downloaded successfully')
    } catch (err) {
      toast.error('Failed to generate CSV report')
    } finally {
      setCsvLoading(false)
    }
  }

  const handlePdfDownload = async () => {
    setPdfLoading(true)
    try {
      const res = await downloadPdfReport()
      triggerDownload(res.data, `finance_report_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('PDF Report downloaded successfully')
    } catch (err) {
      toast.error('Failed to generate PDF report')
    } finally {
      setPdfLoading(false)
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

      <Box sx={{ mb: 4 }}>
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
          Reports & Analytical Exports
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(241, 245, 249, 0.45)', fontWeight: 500 }}>
          Generate spreadsheets, print-ready PDF statements, and audit historical balances.
        </Typography>
      </Box>

      {/* Financial Summary Card */}
      {loading ? (
        <Skeleton variant="rounded" height={150} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '20px', mb: 4 }} />
      ) : (
        <Card sx={{ ...glassCardSx, mb: 4 }}>
          <CardContent sx={{ p: '28px !important' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', mb: 3.5, fontSize: '1.05rem', letterSpacing: '0.02em' }}>
              CURRENT STANDING AUDIT SUMMARY
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)',
                    }}
                  >
                    <TrendingUpIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(241, 245, 249, 0.45)', fontWeight: 500, display: 'block', mb: 0.5 }}>
                      TOTAL INCOME FLOW
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981', fontFamily: "'JetBrains Mono', monospace", fontSize: '1.45rem' }}>
                      {formatCurrency(summaryData?.totalIncome)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: 'rgba(244, 63, 94, 0.12)',
                      color: '#f43f5e',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      boxShadow: '0 0 15px rgba(244, 63, 94, 0.15)',
                    }}
                  >
                    <TrendingDownIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(241, 245, 249, 0.45)', fontWeight: 500, display: 'block', mb: 0.5 }}>
                      TOTAL EXPENSES LOGGED
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#f43f5e', fontFamily: "'JetBrains Mono', monospace", fontSize: '1.45rem' }}>
                      {formatCurrency(summaryData?.totalExpense)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: 'rgba(99, 102, 241, 0.12)',
                      color: '#818cf8',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      boxShadow: '0 0 15px rgba(99, 102, 241, 0.15)',
                    }}
                  >
                    <AccountBalanceWalletIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(241, 245, 249, 0.45)', fontWeight: 500, display: 'block', mb: 0.5 }}>
                      NET WALLET BALANCE
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#818cf8', fontFamily: "'JetBrains Mono', monospace", fontSize: '1.45rem' }}>
                      {/* Using currentBalance key mapped correctly to the dashboard data */}
                      {formatCurrency(summaryData?.currentBalance ?? summaryData?.netBalance)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Export Section Cards */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={hoverExportCardSx('#6366f1')}>
            <CardContent sx={{ flexGrow: 1, p: '40px !important', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box
                className="glow-icon-wrap"
                sx={{
                  p: 2.5,
                  borderRadius: '24px',
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  color: '#818cf8',
                  mb: 3.5,
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                <TableChartIcon sx={{ fontSize: 52 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', mb: 1.5, fontSize: '1.3rem' }}>
                CSV Ledger Spreadsheet
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(241, 245, 249, 0.45)', mb: 4, maxWidth: 360, lineHeight: 1.6, fontSize: '0.9rem' }}>
                Download a raw tabular layout containing all your historical income and expense transactions. Ideal for custom offline audits, MS Excel, or Google Sheets analysis.
              </Typography>
              <Box sx={{ mt: 'auto', width: '100%' }}>
                <Divider sx={{ mb: 3.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCsvDownload}
                  disabled={csvLoading}
                  startIcon={csvLoading ? <CircularProgress size={20} color="inherit" /> : <TableChartIcon />}
                  sx={{
                    py: 1.8,
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)',
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                      boxShadow: '0 6px 24px rgba(99, 102, 241, 0.5)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {csvLoading ? 'Compiling Spreadsheet...' : 'Export to CSV'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={hoverExportCardSx('#06b6d4')}>
            <CardContent sx={{ flexGrow: 1, p: '40px !important', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box
                className="glow-icon-wrap"
                sx={{
                  p: 2.5,
                  borderRadius: '24px',
                  bgcolor: 'rgba(6, 182, 212, 0.1)',
                  color: '#22d3ee',
                  mb: 3.5,
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                }}
              >
                <PictureAsPdfIcon sx={{ fontSize: 52 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', mb: 1.5, fontSize: '1.3rem' }}>
                PDF Audit Statement
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(241, 245, 249, 0.45)', mb: 4, maxWidth: 360, lineHeight: 1.6, fontSize: '0.9rem' }}>
                Generate a beautifully styled, print-friendly formal PDF document summarizing your personal income streams, category spend ratios, and recent transaction history.
              </Typography>
              <Box sx={{ mt: 'auto', width: '100%' }}>
                <Divider sx={{ mb: 3.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handlePdfDownload}
                  disabled={pdfLoading}
                  startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                  sx={{
                    py: 1.8,
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    boxShadow: '0 4px 20px rgba(6, 182, 212, 0.35)',
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                      boxShadow: '0 6px 24px rgba(6, 182, 212, 0.5)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {pdfLoading ? 'Structuring Statement...' : 'Download PDF Statement'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ReportsPage
