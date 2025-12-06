import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  Chip,
  Button,
  CircularProgress,
  Modal,
  TextField,
  Stack,
  Divider,
  Alert,
  Paper,
  IconButton,
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
  Slide,
  Fade,
  Zoom,
  Tooltip,
  Avatar,
  Rating,
  Skeleton,
  LinearProgress,
  CardHeader,
  Collapse,
  CardActionArea,
  styled
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  VideoLibrary as VideoIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Info as InfoIcon,
  School as SchoolIcon,
  Category as CategoryIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareOutlinedIcon,
  Bookmark as BookmarkOutlinedIcon,
  BookmarkBorder as BookmarkBorderOutlinedIcon,
  FileDownload as FileDownloadIcon,
  CloudDownload as CloudDownloadIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  LocalOffer as LocalOfferIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  HelpOutline as HelpOutlineIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Reddit as RedditIcon,
  Telegram as TelegramIcon,
  ContentCopy as ContentCopyIcon,
  Link as LinkIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  PictureInPicture as PictureInPictureIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  CloudUpload as CloudUploadIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  CloudQueue as CloudQueueIcon,
  Cloud as CloudIcon,
  CloudCircle as CloudCircleIcon,
  CloudDone as CloudDoneOutlinedIcon,
  CloudOff as CloudOffOutlinedIcon,
  CloudQueue as CloudQueueOutlinedIcon,
  Cloud as CloudOutlinedIcon,
  CloudCircle as CloudCircleOutlinedIcon,
  CloudDone as CloudDoneTwoToneIcon,
  CloudOff as CloudOffTwoToneIcon,
  CloudQueue as CloudQueueTwoToneIcon,
  Cloud as CloudTwoToneIcon,
  CloudCircle as CloudCircleTwoToneIcon,
  CloudDone as CloudDoneRoundedIcon,
  CloudOff as CloudOffRoundedIcon,
  CloudQueue as CloudQueueRoundedIcon,
  Cloud as CloudRoundedIcon,
  CloudCircle as CloudCircleRoundedIcon,
  CloudDone as CloudDoneSharpIcon,
  CloudOff as CloudOffSharpIcon,
  CloudQueue as CloudQueueSharpIcon,
  Cloud as CloudSharpIcon,
  CloudCircle as CloudCircleSharpIcon,
  CloudDone as CloudDoneOutlinedIcon2,
  CloudOff as CloudOffOutlinedIcon2,
  CloudQueue as CloudQueueOutlinedIcon2,
  Cloud as CloudOutlinedIcon2,
  CloudCircle as CloudCircleOutlinedIcon2,
  CloudDone as CloudDoneTwoToneIcon2,
  CloudOff as CloudOffTwoToneIcon2,
  CloudQueue as CloudQueueTwoToneIcon2,
  Cloud as CloudTwoToneIcon2,
  CloudCircle as CloudCircleTwoToneIcon2,
  CloudDone as CloudDoneRoundedIcon2,
  CloudOff as CloudOffRoundedIcon2,
  CloudQueue as CloudQueueRoundedIcon2,
  Cloud as CloudRoundedIcon2,
  CloudCircle as CloudCircleRoundedIcon2,
  CloudDone as CloudDoneSharpIcon2,
  CloudOff as CloudOffSharpIcon2,
  CloudQueue as CloudQueueSharpIcon2,
  Cloud as CloudSharpIcon2,
  CloudCircle as CloudCircleSharpIcon2
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import PublicLayout from '../components/Layout/PublicLayout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { loadRazorpay } from '../utils/razorpay';
// Custom date formatting function
const formatDistanceToNow = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `${interval} ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

// Custom styled components
const PreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '500px',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    height: '400px',
  },
  [theme.breakpoints.down('sm')]: {
    height: '300px',
  },
}));

const PreviewContent = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  overflow: 'auto',
});

const PreviewToolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const PreviewNavButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const PreviewThumbnail = styled(Box)(({ theme, active }) => ({
  width: '60px',
  height: '60px',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  cursor: 'pointer',
  opacity: active ? 1 : 0.7,
  border: active ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    opacity: 1,
    transform: 'scale(1.05)',
  },
}));

const ThumbnailImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const PreviewThumbnails = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: '3px',
  },
}));

const PreviewIframe = styled('iframe')({
  width: '100%',
  height: '100%',
  border: 'none',
  backgroundColor: 'white',
});

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
});

const PreviewUnsupported = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
}));

const PreviewLoading = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
});

const PreviewError = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: theme.spacing(4),
  color: theme.palette.error.main,
}));

// File type detection
const getFileType = (url) => {
  if (!url) return 'unknown';
  
  const extension = url.split('.').pop().toLowerCase();
  
  // Image formats
  const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  if (imageFormats.includes(extension)) return 'image';
  
  // Document formats
  const documentFormats = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  if (documentFormats.includes(extension)) return 'document';
  
  // Spreadsheet formats
  const spreadsheetFormats = ['xls', 'xlsx', 'ods', 'csv'];
  if (spreadsheetFormats.includes(extension)) return 'spreadsheet';
  
  // Presentation formats
  const presentationFormats = ['ppt', 'pptx', 'odp'];
  if (presentationFormats.includes(extension)) return 'presentation';
  
  // Video formats
  const videoFormats = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
  if (videoFormats.includes(extension)) return 'video';
  
  // Audio formats
  const audioFormats = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
  if (audioFormats.includes(extension)) return 'audio';
  
  // Archive formats
  const archiveFormats = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
  if (archiveFormats.includes(extension)) return 'archive';
  
  // Code formats
  const codeFormats = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt'];
  if (codeFormats.includes(extension)) return 'code';
  
  return 'unknown';
};

// Get icon for file type
const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'image':
      return <ImageIcon fontSize="large" />;
    case 'document':
      return <DocumentIcon fontSize="large" />;
    case 'pdf':
      return <PdfIcon fontSize="large" />;
    case 'video':
      return <VideoIcon fontSize="large" />;
    default:
      return <DescriptionIcon fontSize="large" />;
  }
};

const MaterialDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Material and related materials state
  const [material, setMaterial] = useState(null);
  const [relatedMaterials, setRelatedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Checkout state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    email: '',
    mobile: '',
  });
  const [checkoutErrors, setCheckoutErrors] = useState({
    email: '',
    mobile: '',
  });
  const [processing, setProcessing] = useState(false);
  
  // Preview state
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // Reset preview loading when material changes
  useEffect(() => {
    if (material) {
      setPreviewLoading(true);
      setPreviewError(null);
    }
  }, [material?._id]);
  
  // Get all previewable files from material
  const previewFiles = material?.previewUrls || [];
  const currentFile = previewFiles[currentPreviewIndex] || {};
  const fileType = getFileType(currentFile.url);
  
  // Handle preview navigation
  const goToNextPreview = () => {
    setCurrentPreviewIndex((prevIndex) => 
      prevIndex < previewFiles.length - 1 ? prevIndex + 1 : 0
    );
  };
  
  const goToPrevPreview = () => {
    setCurrentPreviewIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : previewFiles.length - 1
    );
  };
  
  const goToPreview = (index) => {
    setCurrentPreviewIndex(index);
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle zoom in/out
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 3));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoomLevel(1);
  
  // Handle rotation
  const rotateLeft = () => setRotation(prev => (prev - 90) % 360);
  const rotateRight = () => setRotation(prev => (prev + 90) % 360);
  
  // Handle preview loading states
  const handlePreviewLoad = () => {
    setPreviewLoading(false);
    setPreviewError(null);
  };
  
  const handlePreviewError = () => {
    setPreviewLoading(false);
    setPreviewError('Failed to load preview');
  };
  
  // Reset preview loading when material changes
  useEffect(() => {
    if (material) {
      setPreviewLoading(true);
      setPreviewError(null);
    }
  }, [material?._id]);

  // Fetch material data
  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/materials/${id}`);
        
        if (response.success && response.material) {
          setMaterial(response.material);
          
          // Fetch related materials
          const relatedParams = {
            limit: 4,
            category: response.material.category,
            classLevel: response.material.classLevel,
          };
          try {
            const relatedResponse = await api.get('/materials', { params: relatedParams });
            // Filter out current material
            const filtered = (relatedResponse.materials || []).filter(
              (m) => m._id !== response.material._id
            );
            setRelatedMaterials(filtered.slice(0, 3));
          } catch (relatedError) {
            console.error('Error fetching related materials:', relatedError);
            // Don't show error for related materials, just continue
          }
        } else {
          toast.error('Material not found');
        }
      } catch (error) {
        console.error('Error fetching material:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load material';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMaterial();
    }
  }, [id]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    if (!mobile) return true; // Mobile is optional
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile.replace(/\D/g, ''));
  };

  const validateCheckoutForm = () => {
    const errors = { email: '', mobile: '' };
    let isValid = true;

    if (!checkoutData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(checkoutData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (checkoutData.mobile && !validateMobile(checkoutData.mobile)) {
      errors.mobile = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    setCheckoutErrors(errors);
    return isValid;
  };

  const handleFreeCheckout = async () => {
    if (!validateCheckoutForm()) {
      return;
    }

    setProcessing(true);
    try {
      let recaptchaToken = '';
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha('free_checkout');
        } catch (recaptchaError) {
          console.warn('reCAPTCHA execution failed, continuing without token:', recaptchaError);
          // Continue without reCAPTCHA token - backend will handle gracefully
        }
      }

      const response = await api.post('/checkout/free', {
        materialId: id,
        email: checkoutData.email,
        mobile: checkoutData.mobile,
        recaptchaToken,
      });

      if (!response.success || !response.downloadUrl) {
        toast.error(response.message || 'Failed to process free download');
        setProcessing(false);
        return;
      }

      // Handle the download URL - use the full URL if provided, otherwise construct it
      let downloadUrl = response.downloadUrl;
      
      if (!downloadUrl) {
        toast.error('Download URL not found');
        return;
      }
      
      // If it's not a full URL, construct it using the API base URL
      if (!downloadUrl.match(/^https?:\/\//)) {
        const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
        // Ensure we don't have double slashes
        const cleanPath = downloadUrl.startsWith('/') ? downloadUrl.substring(1) : downloadUrl;
        downloadUrl = `${apiBase.replace(/\/$/, '')}/${cleanPath}`;
      }
      
      // Open in new tab for better UX
      const newWindow = window.open('', '_blank');
      newWindow.location.href = downloadUrl;
      
      toast.success('Download started!');
      setCheckoutOpen(false);
      setProcessing(false);
    } catch (error) {
      console.error('Free checkout error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download material';
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  const handlePaidCheckout = async () => {
    if (!validateCheckoutForm()) {
      return;
    }

    setProcessing(true);
    try {
      let recaptchaToken = '';
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha('paid_checkout');
        } catch (recaptchaError) {
          console.warn('reCAPTCHA execution failed, continuing without token:', recaptchaError);
          // Continue without reCAPTCHA token - backend will handle gracefully
        }
      }

      // Create Razorpay order
      const orderResponse = await api.post('/checkout/create-order', {
        materialId: id,
        email: checkoutData.email,
        mobile: checkoutData.mobile,
        recaptchaToken,
      });

      if (!orderResponse.success || !orderResponse.order) {
        toast.error(orderResponse.message || 'Failed to create order');
        setProcessing(false);
        return;
      }

      const { order, key } = orderResponse;

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'MaterialPro',
        description: material.title,
        order_id: order.id,
        prefill: {
          email: checkoutData.email,
          contact: checkoutData.mobile,
        },
        handler: async (response) => {
          try {
            setProcessing(true);
            let recaptchaToken = '';
            if (executeRecaptcha) {
              try {
                recaptchaToken = await executeRecaptcha('verify_payment');
              } catch (recaptchaError) {
                console.warn('reCAPTCHA execution failed, continuing without token:', recaptchaError);
                // Continue without reCAPTCHA token - backend will handle gracefully
              }
            }

            const verifyResponse = await api.post('/checkout/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              materialId: id,
              email: checkoutData.email,
              mobile: checkoutData.mobile,
              recaptchaToken,
            });

            if (!verifyResponse.success || !verifyResponse.downloadUrl) {
              toast.error(verifyResponse.message || 'Payment verification failed');
              setProcessing(false);
              return;
            }

            // Download the file - fix double /api issue
            let downloadUrl = verifyResponse.downloadUrl;
            if (!downloadUrl.startsWith('http')) {
              const apiBase = import.meta.env.VITE_API_URL || '/api';
              // Remove leading /api if downloadUrl already starts with /api
              if (downloadUrl.startsWith('/api')) {
                downloadUrl = downloadUrl.substring(4); // Remove '/api'
              }
              downloadUrl = `${apiBase}${downloadUrl}`;
            }
            window.open(downloadUrl, '_blank');
            
            toast.success('Payment successful! Download started.');
            setCheckoutOpen(false);
            setProcessing(false);
          } catch (error) {
            console.error('Payment verification error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Payment verification failed';
            toast.error(errorMessage);
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response);
        toast.error(response.error.description || 'Payment failed. Please try again.');
        setProcessing(false);
      });
      razorpay.open();
    } catch (error) {
      console.error('Paid checkout error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate payment';
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  const handleCheckoutClick = () => {
    setCheckoutOpen(true);
  };

  if (loading) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        </Container>
      </PublicLayout>
    );
  }

  if (!material) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">Material not found</Alert>
        </Container>
      </PublicLayout>
    );
  }

  const isFree = material.priceINR === 0;

  return (
    <>
      <Helmet>
        <title>{material.title} - MaterialPro</title>
        <meta name="description" content={material.description} />
      </Helmet>
      
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={4}>
              {/* Preview Image */}
              <Grid item xs={12} md={6}>
                <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                  {material.previewImageId ? (
                    <>
                      {previewLoading && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                            zIndex: 1,
                          }}
                        >
                          <CircularProgress />
                        </Box>
                      )}
                      <CardMedia
                        component="img"
                        height="600"
                        image={`${import.meta.env.VITE_API_URL || '/api'}/materials/${material._id}/preview?t=${Date.now()}`}
                        alt={material.title}
                        sx={{ 
                          objectFit: 'contain', 
                          bgcolor: 'grey.100',
                          width: '100%',
                          maxHeight: '600px',
                          minHeight: '400px',
                          aspectRatio: '4/3',
                          transition: 'opacity 0.3s ease',
                          opacity: previewLoading ? 0 : 1,
                        }}
                        onLoad={handlePreviewLoad}
                        onError={(e) => {
                          console.error('Preview image failed to load for material:', material._id, 'previewImageId:', material.previewImageId);
                          handlePreviewError();
                          e.target.style.display = 'none';
                        }}
                      />
                      {previewError && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                            p: 4,
                          }}
                        >
                          <ImageNotSupportedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" align="center">
                            Preview unavailable
                          </Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box
                      sx={{
                        height: 600,
                        minHeight: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        p: 4,
                      }}
                    >
                      <ImageNotSupportedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" align="center">
                        No preview available
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        Preview will be shown here once uploaded
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>

              {/* Details */}
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                      {material.title}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                      {material.classLevel && (
                        <Chip label={`Class ${material.classLevel}`} />
                      )}
                      {material.category && (
                        <Chip label={material.category} color="primary" variant="outlined" />
                      )}
                      {material.subject && (
                        <Chip label={material.subject} variant="outlined" />
                      )}
                      {material.isFeatured && (
                        <Chip label="Featured" color="secondary" />
                      )}
                    </Stack>
                    <Typography
                      variant="h4"
                      color={isFree ? 'success.main' : 'primary.main'}
                      fontWeight="bold"
                    >
                      {isFree ? 'Free' : `₹${material.priceINR}`}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Description
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {material.description}
                    </Typography>
                  </Box>

                  {material.tags && material.tags.length > 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Tags
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {material.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Box>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleCheckoutClick}
                      disabled={processing}
                      sx={{ py: 1.5 }}
                    >
                      {processing ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : isFree ? (
                        'Download Free'
                      ) : (
                        `Buy Now for ₹${material.priceINR}`
                      )}
                    </Button>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </motion.div>

          {/* Related Materials */}
          {relatedMaterials.length > 0 && (
            <Box sx={{ mt: 8 }}>
              <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                Related Materials
              </Typography>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {relatedMaterials.map((related, index) => (
                  <Grid item xs={12} sm={6} md={4} key={related._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: 6,
                          },
                        }}
                      >
                        {related.previewImageId && (
                          <CardMedia
                            component="img"
                            height="200"
                            image={`${import.meta.env.VITE_API_URL || '/api'}/materials/${related._id}/preview`}
                            alt={related.title}
                            sx={{ objectFit: 'cover' }}
                          />
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {related.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {related.description}
                          </Typography>
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {related.priceINR === 0 ? 'Free' : `₹${related.priceINR}`}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button
                            component={Link}
                            to={`/materials/${related._id}`}
                            fullWidth
                            variant="contained"
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>

        {/* Checkout Modal */}
        <Modal
          open={checkoutOpen}
          onClose={() => !processing && setCheckoutOpen(false)}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  {isFree ? 'Download Free Material' : 'Complete Purchase'}
                </Typography>
                <IconButton
                  onClick={() => setCheckoutOpen(false)}
                  disabled={processing}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={checkoutData.email}
                onChange={(e) => {
                  setCheckoutData((prev) => ({ ...prev, email: e.target.value }));
                  if (checkoutErrors.email) {
                    setCheckoutErrors((prev) => ({ ...prev, email: '' }));
                  }
                }}
                error={!!checkoutErrors.email}
                helperText={checkoutErrors.email}
                disabled={processing}
                autoComplete="email"
              />

              <TextField
                label="Mobile (Optional)"
                type="tel"
                fullWidth
                value={checkoutData.mobile}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setCheckoutData((prev) => ({ ...prev, mobile: value }));
                  if (checkoutErrors.mobile) {
                    setCheckoutErrors((prev) => ({ ...prev, mobile: '' }));
                  }
                }}
                error={!!checkoutErrors.mobile}
                helperText={checkoutErrors.mobile || '10-digit mobile number'}
                disabled={processing}
                autoComplete="tel"
                inputProps={{ maxLength: 10 }}
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={isFree ? handleFreeCheckout : handlePaidCheckout}
                disabled={processing || !checkoutData.email}
              >
                {processing ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isFree ? (
                  'Download Now'
                ) : (
                  `Pay ₹${material.priceINR}`
                )}
              </Button>
            </Stack>
          </Box>
        </Modal>
      </PublicLayout>
    </>
  );
};

export default MaterialDetailPage;

