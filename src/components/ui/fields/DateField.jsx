// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { useField } from 'formik';
// import clsx from 'clsx';
// import {
//   XCircle,
//   Calendar as CalendarIcon,
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
// } from 'lucide-react';
// import {
//   format,
//   isSameDay,
//   startOfMonth,
//   endOfMonth,
//   addMonths,
//   subMonths,
//   addDays,
//   isValid,
//   parse,
//   startOfDay,
//   endOfDay,
//   parseISO,
//   isBefore,
//   isAfter,
//   isWithinInterval,
// } from 'date-fns';
// import { enUS } from 'date-fns/locale/en-US';
// import { DayPicker } from 'react-day-picker';
// import 'react-day-picker/style.css';

// // Enhanced custom CSS with modern design patterns
// const customDayPickerStyles = `
//   .rdp {
//     --rdp-cell-size: 44px;
//     --rdp-background-color: transparent;
//     --rdp-accent-color: #3b82f6;
//     --rdp-accent-color-dark: #2563eb;
//   }

//   .rdp-button {
//     border-radius: 8px;
//     transition: all 0.2s ease;
//     font-weight: 500;
//   }

//   .rdp-button:not([disabled]):hover {
//     background-color: #f3f4f6;
//     transform: translateY(-1px);
//   }

//   .rdp-button:not([disabled]):active {
//     background-color: #e5e7eb;
//     transform: translateY(0);
//   }

//   .rdp-day_selected:not(.rdp-day_range_start):not(.rdp-day_range_end):not(.rdp-day_range_middle),
//   .rdp-day_selected:not(.rdp-day_range_start):not(.rdp-day_range_end):hover {
//     background-color: var(--rdp-accent-color) !important;
//     color: white !important;
//   }

//   .rdp-day_range_middle {
//     background-color: #dbeafe !important;
//     color: #1d4ed8 !important;
//     border-radius: 0 !important;
//   }

//   .rdp-day_range_start {
//     border-top-right-radius: 0 !important;
//     border-bottom-right-radius: 0 !important;
//   }

//   .rdp-day_range_end {
//     border-top-left-radius: 0 !important;
//     border-bottom-left-radius: 0 !important;
//   }

//   .rdp-day_range_start, .rdp-day_range_end, .rdp-day_selected {
//     background-color: var(--rdp-accent-color) !important;
//     color: white !important;
//   }

//   .rdp-day_today {
//     border: 2px solid #93c5fd;
//     font-weight: 700;
//     background-color: #eff6ff;
//   }

//   .rdp-nav_button {
//     padding: 0.5rem;
//     border-radius: 8px;
//     transition: all 0.2s ease;
//   }

//   .rdp-nav_button:hover {
//     background-color: #f3f4f6;
//   }

//   .rdp-caption_label {
//     font-weight: 600;
//     color: #1f2937;
//   }

//   .rdp-head_cell {
//     font-weight: 600;
//     color: #6b7280;
//     font-size: 0.875rem;
//   }

//   .rdp-day {
//     border-radius: 8px;
//     font-weight: 500;
//     transition: all 0.2s ease;
//   }

//   .rdp-day_outside {
//     opacity: 0.3;
//   }

//   .rdp-day_disabled {
//     opacity: 0.3;
//     cursor: not-allowed;
//   }

//   /* Custom animations */
//   @keyframes slideIn {
//     from {
//       opacity: 0;
//       transform: translateY(-10px) scale(0.95);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0) scale(1);
//     }
//   }

//   .animate-slideIn {
//     animation: slideIn 0.2s ease-out;
//   }

//   /* 🔥 Visual Enhancements */

//   /* 1. Depth & Glassmorphism */
//   .datefield-calendar {
//     background: rgba(255, 255, 255, 0.95);
//     backdrop-filter: blur(12px);
//     border: 1px solid rgba(229, 231, 235, 0.6);
//     box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
//     border-radius: 16px;
//     transition: all 0.25s ease;
//   }

//   /* 2. Micro Interactions */
//   .rdp-day {
//     transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease;
//   }
//   .rdp-day:not([disabled]):hover {
//     transform: scale(1.05);
//     box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
//   }
//   .rdp-day:active {
//     transform: scale(0.95);
//   }

//   /* 3. Premium Quick Ranges */
//   .quick-range-btn {
//     background: #f9fafb;
//     border: 1px solid #e5e7eb;
//     border-radius: 9999px;
//     font-size: 0.75rem;
//     font-weight: 600;
//     padding: 0.4rem 0.8rem;
//     transition: all 0.2s ease;
//   }
//   .quick-range-btn:hover {
//     background: #eef2ff;
//     border-color: #6366f1;
//     color: #4338ca;
//   }
//   .quick-range-btn:active {
//     background: #e0e7ff;
//     transform: scale(0.97);
//   }

//   /* 4. Iconography Polish */
//   .calendar-toggle-btn {
//     background: #f9fafb;
//     border-radius: 50%;
//     padding: 0.5rem;
//     transition: all 0.2s ease;
//   }
//   .calendar-toggle-btn:hover {
//     background: #e5e7eb;
//   }

//   /* 5. Typography Hierarchy */
//   .rdp-head_cell {
//     text-transform: uppercase;
//     letter-spacing: 0.05em;
//     font-size: 0.7rem;
//     font-weight: 600;
//     color: #9ca3af;
//   }
//   .rdp-caption_label {
//     font-weight: 600;
//     letter-spacing: -0.025em;
//   }

//   /* 6. Success/Error States */
//   input[aria-invalid="true"] {
//     border-color: #ef4444;
//     box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
//     animation: shake 0.2s ease-in-out 0s 2;
//   }
//   input[data-success="true"] {
//     border-color: #22c55e;
//     box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
//   }

//   @keyframes shake {
//     0%, 100% { transform: translateX(0) }
//     25% { transform: translateX(-2px) }
//     75% { transform: translateX(2px) }
//   }

//   /* Range preview gradient */
//   .rdp-day_range_middle {
//     background-image: linear-gradient(to right, #dbeafe 0%, #e0e7ff 100%);
//     color: #1d4ed8 !important;
//   }

//   /* Fix for broken layout */
//   .rdp-caption {
//     width: 100%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     position: relative;
//   }

//   .rdp-nav {
//     position: absolute;
//     top: 50%;
//     transform: translateY(-50%);
//     display: flex;
//     align-items: center;
//     justify-content: center;
//   }
//   .rdp-nav:first-of-type {
//     left: 0;
//   }
//   .rdp-nav:last-of-type {
//     right: 0;
//   }
//   .rdp-caption_label {
//     flex-grow: 1;
//     text-align: center;
//     margin-left: 1.5rem;
//     margin-right: 1.5rem;
//   }

//   /* NEW: Range selection indicators */
//   .range-selection-indicator {
//     background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
//     color: white;
//     padding: 0.5rem 1rem;
//     border-radius: 8px;
//     font-size: 0.875rem;
//     font-weight: 600;
//     margin-bottom: 0.5rem;
//     text-align: center;
//   }

//   .range-selection-indicator.start {
//     background: linear-gradient(135deg, #10b981 0%, #059669 100%);
//   }

//   .range-selection-indicator.end {
//     background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
//   }

//   /* NEW: Selected dates display */
//   .selected-dates-display {
//     background: #f8fafc;
//     border: 1px solid #e2e8f0;
//     border-radius: 8px;
//     padding: 0.75rem;
//     margin-bottom: 0.75rem;
//     font-size: 0.875rem;
//   }

//   .selected-date-item {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 0.25rem;
//   }

//   .selected-date-item:last-child {
//     margin-bottom: 0;
//   }

//   .selected-date-label {
//     font-weight: 600;
//     color: #475569;
//   }

//   .selected-date-value {
//     color: #1e293b;
//     font-weight: 500;
//   }
// `;

// // Corrected helper functions to work with UTC
// const getUTCToday = () => {
//   const now = new Date();
//   return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
// };

// const getUTCDate = (date) => {
//   if (!date) return null;
//   return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
// };

// const quickRanges = {
//   Today: [getUTCToday(), getUTCToday()],
//   Yesterday: [addDays(getUTCToday(), -1), addDays(getUTCToday(), -1)],
//   'Last 7 Days': [addDays(getUTCToday(), -6), getUTCToday()],
//   'This Month': [startOfMonth(getUTCToday()), endOfMonth(getUTCToday())],
//   'Last Month': [
//     startOfMonth(subMonths(getUTCToday(), 1)),
//     endOfMonth(subMonths(getUTCToday(), 1)),
//   ],
//   'Next 30 Days': [getUTCToday(), addDays(getUTCToday(), 30)],
// };

// const DateField = ({
//   name,
//   label,
//   className,
//   disabled = false,
//   value,
//   onChange,
//   range = true,
//   minDate = null,
//   maxDate = null,
//   placeholder = 'Select date',
//   required = false,
//   error = null,
//   format: dateFormat = 'MMM dd, yyyy',
//   locale = enUS,
//   allowManualInput = true,
//   utc = true,
//   onCalendarOpen,
//   onCalendarClose,
//   showQuickRanges = true,
//   showOutsideDays = true,
//   preventPastDates = false,
//   preventFutureDates = false,
// }) => {
//   const isFormik = !!name;
//   const [field, meta, helpers] = isFormik ? useField(name) : [{}, {}, {}];

//   const toUTCDate = useCallback((date) => {
//     if (!date) return null;
//     if (utc) {
//       // Use the corrected getUTCDate function
//       return getUTCDate(date);
//     }
//     return date;
//   }, [utc]);

//   // 🟢 FIX: A new helper to parse various date formats
//   const parseDateInput = (input) => {
//     if (input instanceof Date && isValid(input)) {
//       return input;
//     }
//     if (typeof input === 'string') {
//       const parsed = parseISO(input);
//       if (isValid(parsed)) {
//         return parsed;
//       }
//     }
//     return null;
//   };

//   // 🟢 FIX: Updated useState to use the new helper function
//   const [selected, setSelected] = useState(() => {
//     if (range) {
//       const initialStart = isFormik ? field.value?.[0] : value?.[0];
//       const initialEnd = isFormik ? field.value?.[1] : value?.[1];
//       return {
//         from: parseDateInput(initialStart),
//         to: parseDateInput(initialEnd),
//       };
//     } else {
//       const initialDate = isFormik ? field.value : value;
//       return {
//         from: parseDateInput(initialDate),
//         to: null,
//       };
//     }
//   });

//   const [isOpen, setIsOpen] = useState(false);
//   const [animationState, setAnimationState] = useState('closed');
//   const [position, setPosition] = useState("bottom");
//   const [inputValue, setInputValue] = useState('');
//   const [hoveredDate, setHoveredDate] = useState(null);
//   const [currentMonth, setCurrentMonth] = useState(selected.from || new Date());
//   const [rangeStep, setRangeStep] = useState('start'); // 'start' or 'end'

//   const containerRef = useRef(null);
//   const calendarRef = useRef(null);
//   const inputRef = useRef(null);

//   // Enhanced date validation
//   const validateDateRange = useCallback((from, to) => {
//     if (!from && !to) return true;

//     const now = getUTCToday();

//     if (preventPastDates && from && isBefore(from, now)) {
//       return { error: 'Past dates are not allowed' };
//     }

//     if (preventFutureDates && from && isAfter(from, now)) {
//       return { error: 'Future dates are not allowed' };
//     }

//     if (minDate && from && isBefore(from, minDate)) {
//       return { error: `Start date cannot be before ${safeFormat(minDate, dateFormat)}` };
//     }

//     if (maxDate && to && isAfter(to, maxDate)) {
//       return { error: `End date cannot be after ${safeFormat(maxDate, dateFormat)}` };
//     }

//     if (range && from && to && isAfter(from, to)) {
//       return { error: 'End date must be after start date' };
//     }

//     return true;
//   }, [minDate, maxDate, range, dateFormat, preventPastDates, preventFutureDates]);

//   // 🟢 FIX: Ensure submitted value is an ISO string
//   const submitValue = useCallback((from, to) => {
//     const validation = validateDateRange(from, to);
//     if (validation !== true) {
//       if (isFormik) helpers.setError(validation.error);
//       return;
//     }

//     const formatDate = (date) => {
//       if (!date || !isValid(date)) return null;
//       return date.toISOString(); // Use the UTC date's ISO string
//     };

//     if (isFormik) {
//       const valueToSet = range ? [formatDate(from), formatDate(to)] : formatDate(from);
//       helpers.setValue(valueToSet);
//       helpers.setError(undefined);
//     } else {
//       const valueToSet = range ? [formatDate(from), formatDate(to)] : formatDate(from);
//       onChange && onChange(valueToSet);
//     }
//   }, [range, isFormik, helpers, onChange, validateDateRange]);

//   // FIXED: Handle date selection for range mode
//   const handleDateSelect = useCallback((dateOrRange) => {
//     if (!dateOrRange) return;

//     // Correctly handle the date object from DayPicker
//     const clickedDate = getUTCDate(dateOrRange);

//     if (range) {
//       if (rangeStep === 'start') {
//         // First click - set start date
//         setSelected({ from: clickedDate, to: null });
//         setRangeStep('end');
//       } else {
//         // Second click - set end date
//         if (isBefore(clickedDate, selected.from)) {
//           // If end date is before start date, reset with new start date
//           setSelected({ from: clickedDate, to: null });
//           setRangeStep('end');
//         } else {
//           setSelected({ from: selected.from, to: clickedDate });
//           setRangeStep('start');
//           setIsOpen(false);
//           submitValue(selected.from, clickedDate);
//         }
//       }
//     } else {
//       setSelected({ from: clickedDate, to: null });
//       submitValue(clickedDate);
//       setIsOpen(false);
//     }
//   }, [range, rangeStep, selected.from, submitValue]);

//   const handleQuickRange = useCallback((key) => {
//     const [from, to] = quickRanges[key];
//     setSelected({ from, to });
//     setRangeStep('start');
//     setIsOpen(false);
//     submitValue(from, to);
//   }, [submitValue]);

//   const handleClear = useCallback((e) => {
//     e.stopPropagation();
//     setSelected({ from: null, to: null });
//     setInputValue('');
//     setHoveredDate(null);
//     setRangeStep('start');
//     if (isFormik) helpers.setError(undefined);
//     submitValue(null, null);
//   }, [submitValue, isFormik, helpers]);

//   const safeFormat = useCallback((date, formatStr) => {
//     if (!date || !isValid(date)) return '';
//     try {
//       return format(date, formatStr, { locale: locale || enUS });
//     } catch (error) {
//       console.warn('Date formatting error:', error);
//       return format(date, formatStr);
//     }
//   }, [locale]);

//   const getDisplayValue = useCallback(() => {
//     if (range && selected.from && selected.to) {
//       return `${safeFormat(selected.from, dateFormat)} - ${safeFormat(selected.to, dateFormat)}`;
//     }
//     if (!range && selected.from) {
//       return safeFormat(selected.from, dateFormat);
//     }
//     if (range && selected.from) {
//       return `${safeFormat(selected.from, dateFormat)} - ${placeholder}`;
//     }
//     return inputValue || '';
//   }, [range, selected, dateFormat, placeholder, inputValue, safeFormat]);

//   const getSelectionStatus = useCallback(() => {
//     if (range) {
//       if (!selected.from && !selected.to) {
//         return 'Select start date';
//       } else if (selected.from && !selected.to) {
//         return 'Select end date';
//       } else if (selected.from && selected.to) {
//         return `${safeFormat(selected.from, dateFormat)} - ${safeFormat(selected.to, dateFormat)}`;
//       }
//     } else {
//       if (selected.from) {
//         return `Selected: ${safeFormat(selected.from, dateFormat)}`;
//       }
//     }
//     return placeholder;
//   }, [range, selected, dateFormat, placeholder, safeFormat]);

//   const handleManualInput = useCallback((e) => {
//     const value = e.target.value;
//     setInputValue(value);

//     const possibleFormats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'MMM dd, yyyy', 'dd MMM yyyy'];
//     let parsedDate = null;

//     for (const formatStr of possibleFormats) {
//       try {
//         parsedDate = parse(value, formatStr, new Date());
//         if (isValid(parsedDate)) break;
//       } catch {
//         continue;
//       }
//     }

//     if (parsedDate && isValid(parsedDate)) {
//       const utcDate = toUTCDate(parsedDate);
//       const validation = validateDateRange(utcDate);

//       if (validation === true) {
//         if (range) {
//           if (!selected.from) {
//             setSelected({ from: utcDate, to: null });
//             setRangeStep('end');
//           } else if (!selected.to) {
//             if (isAfter(utcDate, selected.from) || isSameDay(utcDate, selected.from)) {
//               setSelected({ from: selected.from, to: utcDate });
//               setRangeStep('start');
//               setIsOpen(false);
//               submitValue(selected.from, utcDate);
//             }
//           }
//         } else {
//           setSelected({ from: utcDate, to: null });
//           setIsOpen(false);
//           submitValue(utcDate);
//         }
//       }
//     }
//   }, [range, selected, toUTCDate, submitValue, validateDateRange]);

//   const handleMonthChange = useCallback((month) => {
//     setCurrentMonth(month);
//   }, []);

//   const handleDayMouseEnter = useCallback((day) => {
//     if (range && selected.from && !selected.to) {
//       setHoveredDate(day);
//     }
//   }, [range, selected]);

//   const handleDayMouseLeave = useCallback(() => {
//     setHoveredDate(null);
//   }, []);

//   // Enhanced useEffect for animation and positioning
//   useEffect(() => {
//     if (isOpen) {
//       setAnimationState('opening');
//       const timer = setTimeout(() => setAnimationState('open'), 50);
//       return () => clearTimeout(timer);
//     } else {
//       setAnimationState('closing');
//       const timer = setTimeout(() => setAnimationState('closed'), 300);
//       return () => clearTimeout(timer);
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(event.target) &&
//         isOpen
//       ) {
//         setIsOpen(false);
//       }
//     };

//     if (isOpen) {
//       onCalendarOpen?.();
//       document.addEventListener('mousedown', handleClickOutside);
//     } else {
//       onCalendarClose?.();
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen, onCalendarOpen, onCalendarClose]);

//   useEffect(() => {
//     const updatePosition = () => {
//       if (isOpen && containerRef.current) {
//         const rect = containerRef.current.getBoundingClientRect();
//         const viewportHeight = window.innerHeight;
//         const viewportWidth = window.innerWidth;
//         const spaceBelow = viewportHeight - rect.bottom;
//         const spaceAbove = rect.top;
//         const spaceRight = viewportWidth - rect.right;
//         const vertical = spaceBelow < 400 && spaceAbove > spaceBelow ? "top" : "bottom";
//         const horizontal = spaceRight < 320 ? "right" : "left";
//         setPosition(`${vertical}-${horizontal}`);
//       }
//     };

//     if (isOpen) {
//       updatePosition();
//       window.addEventListener('resize', updatePosition);
//       window.addEventListener('scroll', updatePosition, true);
//       return () => {
//         window.removeEventListener('resize', updatePosition);
//         window.removeEventListener('scroll', updatePosition, true);
//       };
//     }
//   }, [isOpen]);

//   const getFieldError = () => {
//     if (error) return error;
//     if (isFormik && meta.error && meta.touched) return meta.error;
//     return null;
//   };

//   const fieldError = getFieldError();
//   const displayValue = useMemo(() => getDisplayValue(), [getDisplayValue]);
//   const statusText = useMemo(() => getSelectionStatus(), [getSelectionStatus]);

//   // Calculate disabled dates
//   const disabledDays = useMemo(() => {
//     const disabled = [];

//     if (preventPastDates) {
//       disabled.push({ before: getUTCToday() });
//     }

//     if (preventFutureDates) {
//       disabled.push({ after: getUTCToday() });
//     }

//     if (minDate) {
//       disabled.push({ before: minDate });
//     }

//     if (maxDate) {
//       disabled.push({ after: maxDate });
//     }

//     return disabled;
//   }, [minDate, maxDate, preventPastDates, preventFutureDates]);

//   return (
//     <div ref={containerRef} className={clsx('form-control relative', className)}>
//       <style>{customDayPickerStyles}</style>
//       <div className="relative">
//         <div className="relative">
//           {allowManualInput ? (
//             <div className="relative">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={displayValue}
//                 onChange={handleManualInput}
//                 onFocus={() => !disabled && setIsOpen(true)}
//                 placeholder={placeholder}
//                 disabled={disabled}
//                 required={required}
//                 aria-label={label || placeholder}
//                 aria-expanded={isOpen}
//                 aria-haspopup="dialog"
//                 aria-invalid={!!fieldError}
//                 aria-describedby={fieldError ? `${name}-error` : undefined}
//                 className={clsx(
//                   'w-full px-4 py-3 bg-white border rounded-lg transition-all duration-200',
//                   'min-h-[52px] pr-12',
//                   'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
//                   disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
//                   fieldError && 'border-red-500 ring-2 ring-red-500',
//                   !disabled && !fieldError && 'hover:border-gray-400',
//                   (selected.from || selected.to) && 'data-success'
//                 )}
//                 data-success={!!(selected.from || selected.to)}
//               />
//               <button
//                 type="button"
//                 onClick={() => setIsOpen(!isOpen)}
//                 className={clsx(
//                   "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
//                   "calendar-toggle-btn",
//                 )}
//                 aria-label="Open calendar"
//                 disabled={disabled}
//               >
//                 <CalendarIcon className="h-5 w-5 text-gray-400" />
//               </button>
//             </div>
//           ) : (
//             <div
//               onClick={() => !disabled && setIsOpen(!isOpen)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter' || e.key === ' ') {
//                   e.preventDefault();
//                   !disabled && setIsOpen(!isOpen);
//                 }
//               }}
//               tabIndex={disabled ? -1 : 0}
//               role="button"
//               aria-label={label || placeholder}
//               aria-expanded={isOpen}
//               aria-haspopup="dialog"
//               aria-invalid={!!fieldError}
//               className={clsx(
//                 'w-full px-4 py-3 bg-white border rounded-lg cursor-pointer transition-all duration-200 flex items-center',
//                 'min-h-[52px] relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
//                 disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
//                 fieldError && 'border-red-500 ring-2 ring-red-500',
//                 !disabled && !fieldError && 'hover:border-gray-400'
//               )}
//             >
//               <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//               <div className="flex-1 min-w-0 ml-8">
//                 <div
//                   className={clsx(
//                     'absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 text-sm transition-all pointer-events-none',
//                     (selected.from || selected.to) && 'text-xs -top-2 text-blue-500 bg-white px-1'
//                   )}
//                 >
//                   {label}{required && '*'}
//                 </div>
//                 <div className={clsx('truncate pt-1', (selected.from || selected.to) ? 'text-gray-900 font-medium' : 'text-gray-400')}>
//                   {displayValue || label || placeholder}
//                 </div>
//               </div>
//               <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
//             </div>
//           )}
//           {(selected.from || selected.to) && !disabled && (
//             <button
//               type="button"
//               onClick={handleClear}
//               className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
//               aria-label="Clear selected dates"
//               title="Clear dates"
//             >
//               <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//             </button>
//           )}
//         </div>

//         {animationState !== 'closed' && (
//           <div
//             ref={calendarRef}
//             role="dialog"
//             aria-label="Calendar date picker"
//             aria-modal="true"
//             className={clsx(
//               'absolute z-50 datefield-calendar transition-all duration-300 ease-out w-full max-w-sm',
//               'animate-slideIn',
//               position.includes("bottom") ? "mt-2 top-full" : "mb-2 bottom-full",
//               position.includes("right") ? "right-0" : "left-0",
//               animationState === 'opening' && 'opacity-0 scale-95 translate-y-2',
//               animationState === 'open' && 'opacity-100 scale-100 translate-y-0',
//               animationState === 'closing' && 'opacity-0 scale-95 translate-y-2'
//             )}
//           >
//             {/* NEW: Range selection indicator */}
//             {range && (
//               <div className={clsx(
//                 'range-selection-indicator',
//                 rangeStep === 'start' ? 'start' : 'end'
//               )}>
//                 {rangeStep === 'start' ? 'Select Start Date' : 'Select End Date'}
//               </div>
//             )}

//             {/* NEW: Selected dates display */}
//             {range && (selected.from || selected.to) && (
//               <div className="selected-dates-display">
//                 <div className="selected-date-item">
//                   <span className="selected-date-label">Start Date:</span>
//                   <span className="selected-date-value">
//                     {selected.from ? safeFormat(selected.from, dateFormat) : 'Not selected'}
//                   </span>
//                 </div>
//                 <div className="selected-date-item">
//                   <span className="selected-date-label">End Date:</span>
//                   <span className="selected-date-value">
//                     {selected.to ? safeFormat(selected.to, dateFormat) : 'Not selected'}
//                   </span>
//                 </div>
//               </div>
//             )}

//             <div className="px-4 py-3 border-b border-gray-200">
//               <div className="flex items-center justify-center mb-2 relative">
//                 <h3
//                   id="calendar-title"
//                   className="text-lg font-semibold text-gray-900"
//                 >
//                   {safeFormat(currentMonth, 'MMMM yyyy')}
//                 </h3>
//               </div>
//               <div
//                 id="calendar-status"
//                 className="text-sm text-gray-600 font-medium text-center"
//                 aria-live="polite"
//               >
//                 {statusText}
//               </div>
//             </div>

//             {showQuickRanges && range && (
//               <div className="p-3 border-b border-gray-200">
//                 <div className="grid grid-cols-2 gap-1">
//                   {Object.keys(quickRanges).map((key) => (
//                     <button
//                       key={key}
//                       type="button"
//                       onClick={() => handleQuickRange(key)}
//                       className="quick-range-btn"
//                       aria-label={`Select ${key}`}
//                     >
//                       {key}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <DayPicker
//               mode="single" // Always use single mode, handle range logic manually
//               selected={range ? (rangeStep === 'start' ? selected.from : selected.to) : selected.from}
//               onSelect={handleDateSelect}
//               onMonthChange={handleMonthChange}
//               month={currentMonth}
//               disabled={disabledDays}
//               locale={locale}
//               showOutsideDays={showOutsideDays}
//               onDayMouseEnter={handleDayMouseEnter}
//               onDayMouseLeave={handleDayMouseLeave}
//               classNames={{
//                 root: 'p-3',
//                 caption: 'flex justify-center items-center relative',
//                 caption_label: 'text-lg font-semibold text-gray-900',
//                 nav: 'absolute top-1/2 transform -translate-y-1/2 flex items-center',
//                 nav_button: 'p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
//                 nav_icon: 'h-4 w-4 text-gray-600',
//                 months: 'flex flex-col sm:flex-row',
//                 month: 'space-y-4',
//                 table: 'w-full border-collapse',
//                 head: 'border-b border-gray-200',
//                 head_row: 'flex justify-between',
//                 head_cell: 'text-center text-xs font-medium text-gray-500 py-2 flex-1',
//                 row: 'flex justify-between w-full mt-1',
//                 cell: 'p-0.5 relative flex-1 flex justify-center items-center',
//                 day: 'w-10 h-10 rounded-lg text-sm font-medium transition-all duration-150 text-gray-700 hover:bg-gray-100',
//                 day_outside: 'text-gray-300 cursor-default hover:bg-transparent',
//                 day_disabled: 'text-gray-300 cursor-not-allowed',
//                 day_selected: 'bg-blue-500 text-white hover:bg-blue-600',
//                 day_range_middle: 'bg-blue-100 text-blue-700',
//                 day_range_start: 'bg-blue-500 text-white hover:bg-blue-600',
//                 day_range_end: 'bg-blue-500 text-white hover:bg-blue-600',
//                 day_today: 'ring-2 ring-blue-300 font-bold bg-blue-50'
//               }}
//               components={{
//                 IconLeft: () => <ChevronLeft className="h-4 w-4" />,
//                 IconRight: () => <ChevronRight className="h-4 w-4" />,
//               }}
//               modifiers={{
//                 selected: (date) => {
//                   if (range && selected.from && selected.to) {
//                     return isWithinInterval(date, { start: selected.from, end: selected.to });
//                   }
//                   return false;
//                 },
//                 'range-preview': (date) => {
//                   if (range && selected.from && hoveredDate && !selected.to) {
//                     return isWithinInterval(date, { start: selected.from, end: hoveredDate });
//                   }
//                   return false;
//                 },
//                 'range-start': (date) => {
//                   return range && selected.from && isSameDay(date, selected.from);
//                 },
//                 'range-end': (date) => {
//                   return range && selected.to && isSameDay(date, selected.to);
//                 }
//               }}
//               modifiersClassNames={{
//                 'range-preview': 'bg-blue-50 text-blue-600',
//                 'range-start': 'bg-green-500 text-white',
//                 'range-end': 'bg-orange-500 text-white'
//               }}
//             />
//           </div>
//         )}
//       </div>
//       {fieldError && (
//         <p id={`${name}-error`} className="text-red-500 text-xs mt-1" role="alert">
//           {fieldError}
//         </p>
//       )}
//     </div>
//   );
// };

// export default DateField;

// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { useField } from 'formik';
// import clsx from 'clsx';
// import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
// import {
//   format as formatDate,
//   isSameDay,
//   startOfMonth,
//   startOfDay,
//   startOfWeek,
//   endOfMonth,
//   eachDayOfInterval,
//   addMonths,
//   subMonths,
//   addDays,
//   subDays,
//   isValid,
//   parse,
//   parseISO,
//   isBefore,
//   isAfter,
//   isWithinInterval,
//   getDay,
// } from 'date-fns';
// import { enUS } from 'date-fns/locale';

// // --- STYLES ---
// // A responsive, modern stylesheet designed to work in narrow containers.
// const calendarStyles = `
//   :root {
//     --df-bg: #ffffff;
//     --df-text: #111827;
//     --df-text-muted: #6b7280;
//     --df-border: #d1d5db;
//     --df-primary: #111827;
//     --df-primary-text: #ffffff;
//     --df-hover-bg: #f3f4f6;
//     --df-range-bg: #f3f4f6;
//     --df-disabled-text: #9ca3af;
//     --df-radius-lg: 0.75rem;
//     --df-radius-md: 0.5rem;
//     --df-radius-full: 9999px;
//     --df-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
//   }

//   .df-wrapper { position: relative; width: 100%; }
//   .df-input-wrapper { position: relative; }

//   .df-input {
//     width: 100%;
//     padding: 0.625rem 2.75rem 0.625rem 0.75rem;
//     border: 1px solid var(--df-border);
//     border-radius: var(--df-radius-md);
//     background-color: var(--df-bg);
//     color: var(--df-text);
//     font-size: 0.875rem;
//     line-height: 1.25rem;
//     transition: box-shadow 0.2s ease, border-color 0.2s ease;
//   }
//   .df-input:focus {
//     outline: none;
//     border-color: var(--df-primary);
//     box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
//   }
//   .df-input[disabled] { background-color: #f9fafb; cursor: not-allowed; }
//   .df-input::placeholder { color: var(--df-text-muted); }

//   .df-input-icon {
//     position: absolute;
//     top: 50%;
//     transform: translateY(-50%);
//     right: 0.75rem;
//     color: var(--df-text-muted);
//     pointer-events: none;
//   }

//   .df-clear-btn {
//     position: absolute;
//     top: 50%;
//     transform: translateY(-50%);
//     right: 2.5rem;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     width: 1.75rem;
//     height: 1.75rem;
//     border-radius: var(--df-radius-full);
//     background: transparent;
//     border: none;
//     color: #9ca3af;
//     cursor: pointer;
//     transition: background-color 0.2s ease, color 0.2s ease;
//   }
//   .df-clear-btn:hover { background-color: var(--df-hover-bg); color: var(--df-text); }

//   .df-popup {
//     position: absolute;
//     z-index: 50;
//     display: flex;
//     background-color: var(--df-bg);
//     border: 1px solid #e5e7eb;
//     border-radius: var(--df-radius-lg);
//     box-shadow: var(--df-shadow);
//     overflow: hidden;
//     /* Responsive layout */
//     flex-direction: column;
//     width: 295px;
//   }

//   @media (min-width: 500px) {
//     .df-popup {
//       flex-direction: row;
//       width: auto;
//     }
//   }

//   .df-quick-ranges {
//     padding: 0.5rem;
//     border-bottom: 1px solid #e5e7eb;
//     display: flex;
//     flex-direction: row;
//     flex-wrap: wrap;
//     gap: 0.25rem;
//     justify-content: center;
//   }

//   @media (min-width: 500px) {
//     .df-quick-ranges {
//       flex-direction: column;
//       flex-wrap: nowrap;
//       border-bottom: none;
//       border-right: 1px solid #e5e7eb;
//       width: 140px;
//       padding: 0.75rem;
//       justify-content: flex-start;
//     }
//   }

//   .df-quick-range-btn {
//     padding: 0.375rem 0.75rem;
//     border: none;
//     background-color: transparent;
//     border-radius: var(--df-radius-md);
//     text-align: left;
//     font-size: 0.875rem;
//     font-weight: 500;
//     color: var(--df-text);
//     cursor: pointer;
//     transition: background-color 0.2s ease;
//   }
//   .df-quick-range-btn:hover { background-color: var(--df-hover-bg); }

//   .df-calendar { padding: 0.5rem; }
//   .df-header { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.25rem; }
//   .df-header h3 { font-size: 0.875rem; font-weight: 600; text-align: center; flex-grow: 1; }

//   .df-nav-btn {
//     display: flex; align-items: center; justify-content: center;
//     width: 2rem; height: 2rem; border: none; background-color: transparent;
//     border-radius: var(--df-radius-full); cursor: pointer; color: var(--df-text-muted);
//     transition: background-color 0.2s ease, color 0.2s ease;
//   }
//   .df-nav-btn:hover:not([disabled]) { background-color: var(--df-hover-bg); color: var(--df-text); }
//   .df-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }

//   .df-grid { display: grid; grid-template-columns: repeat(7, 1fr); justify-items: center; }
//   .df-weekday {
//     font-size: 0.75rem; font-weight: 500; color: var(--df-text-muted); width: 36px; height: 36px;
//     display: flex; align-items: center; justify-content: center;
//   }

//   .df-day-btn {
//     width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
//     border-radius: var(--df-radius-full); border: none; background-color: transparent;
//     cursor: pointer; font-size: 0.875rem; position: relative; z-index: 1;
//     transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
//   }
//   .df-day-btn:active:not([disabled]) { transform: scale(0.95); }

//   .df-day-btn.is-outside { color: var(--df-text-muted); }
//   .df-day-btn[disabled] { color: var(--df-disabled-text); cursor: not-allowed; text-decoration: line-through; }
//   .df-day-btn.is-today span { border-bottom: 2px solid var(--df-primary); }

//   .df-day-wrapper { position: relative; }
//   .df-day-wrapper:before, .df-day-wrapper:after {
//     content: ''; position: absolute; top: 0; bottom: 0; width: 50%;
//     background-color: transparent; z-index: 0;
//   }

//   .df-day-wrapper.is-in-range:before { left: 0; }
//   .df-day-wrapper.is-in-range:after { right: 0; }
//   .df-day-wrapper.is-range-start:after, .df-day-wrapper.is-range-end:before { background-color: var(--df-range-bg); }
//   .df-day-wrapper.is-in-range:not(.is-range-start):not(.is-range-end) .df-day-btn { background-color: var(--df-range-bg); border-radius: 0; }

//   .df-day-wrapper.is-in-preview:before { left: 0; }
//   .df-day-wrapper.is-in-preview:after { right: 0; }
//   .df-day-wrapper.is-range-start.is-preview-anchor:after { background-color: #f9fafb; }
//   .df-day-wrapper.is-in-preview:not(.is-range-start) .df-day-btn { background-color: #f9fafb; border-radius: 0; }

//   .df-day-btn.is-selected {
//     background-color: var(--df-primary); color: var(--df-primary-text);
//   }
//   .df-day-btn.is-selected:hover { background-color: #374151; }

//   .df-live-region {
//     position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
//     overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;
//   }
// `;

// // --- HELPERS (Identical to original spec) ---
// const getUTCToday = () => {
//   const now = new Date();
//   return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
// };
// const getUTCDate = (date) => {
//   if (!date || !isValid(date)) return null;
//   return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
// };
// const quickRanges = {
//   'Today': [getUTCToday(), getUTCToday()],
//   'Yesterday': [addDays(getUTCToday(), -1), addDays(getUTCToday(), -1)],
//   'Last 7 Days': [addDays(getUTCToday(), -6), getUTCToday()],
//   'This Month': [startOfMonth(getUTCToday()), endOfMonth(getUTCToday())],
// };
// const INPUT_FORMATS = ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'MMM dd, yyyy', 'dd MMM yyyy'];

// // --- THE COMPONENT ---
// const DateField = ({
//   name, label, className, disabled = false, value, onChange, range = false,
//   minDate: minDateProp = null, maxDate: maxDateProp = null, placeholder, required = false,
//   error: errorProp = null, format: displayFormat = 'MMM dd, yyyy', locale = enUS,
//   allowManualInput = true, utc = true, onCalendarOpen, onCalendarClose,
//   showQuickRanges = false, showOutsideDays = true, preventPastDates = false, preventFutureDates = false,
// }) => {
//   const isFormik = !!name;
//   const [field, meta, helpers] = isFormik ? useField(name) : [{}, {}, {}];

//   const [isOpen, setIsOpen] = useState(false);
//   const [inputValue, setInputValue] = useState('');
//   const [liveRegionText, setLiveRegionText] = useState('');

//   // Internal state for managing date selection
//   const [selected, setSelected] = useState({ from: null, to: null });
//   const [rangeStep, setRangeStep] = useState('start');
//   const [hoveredDate, setHoveredDate] = useState(null);
//   const [month, setMonth] = useState(new Date());

//   const wrapperRef = useRef(null);

//   // --- Memos for Derived State & Props ---
//   const minDate = useMemo(() => {
//     const today = getUTCToday();
//     let dates = [];
//     if (preventPastDates) dates.push(today);
//     if (minDateProp) dates.push(getUTCDate(minDateProp));
//     return dates.length ? dates.reduce((a, b) => isAfter(a, b) ? a : b) : null;
//   }, [preventPastDates, minDateProp]);

//   const maxDate = useMemo(() => {
//     const today = getUTCToday();
//     let dates = [];
//     if (preventFutureDates) dates.push(today);
//     if (maxDateProp) dates.push(getUTCDate(maxDateProp));
//     return dates.length ? dates.reduce((a, b) => isBefore(a, b) ? a : b) : null;
//   }, [preventFutureDates, maxDateProp]);

//   // Sync internal state with external `value` prop
//   useEffect(() => {
//     const propValue = isFormik ? field.value : value;
//     const safeParseISO = (v) => (typeof v === 'string' ? parseISO(v) : null);

//     const from = safeParseISO(range ? propValue?.[0] : propValue);
//     const to = safeParseISO(range ? propValue?.[1] : null);


//     setSelected({ from: isValid(from) ? from : null, to: isValid(to) ? to : null });
//     setRangeStep('start');

//     // Set initial calendar month to the selected date or today
//     const initialDate = isValid(from) ? from : getUTCToday();
//     setMonth(initialDate);
//   }, [isFormik, field.value, value, range]);

//   const displayValue = useMemo(() => {
//     if (allowManualInput && inputValue) return inputValue;
//     const { from, to } = selected;
//     if (range) {
//       if (from && to) return `${formatDate(from, displayFormat, { locale })} - ${formatDate(to, displayFormat, { locale })}`;
//       if (from) return `${formatDate(from, displayFormat, { locale })} - ...`;
//     } else if (from) {
//       return formatDate(from, displayFormat, { locale });
//     }
//     return '';
//   }, [allowManualInput, inputValue, selected, range, displayFormat, locale]);

//   const error = isFormik ? meta.error : errorProp;

//   // --- Callbacks & Handlers ---
//   const emitChange = useCallback((data) => {
//     if (isFormik) helpers.setValue(data, true);
//     else onChange?.(data);
//   }, [isFormik, helpers, onChange]);

//   const isDateDisabled = useCallback((date) => {
//     const day = startOfDay(date);
//     if (minDate && isBefore(day, startOfDay(minDate))) return true;
//     if (maxDate && isAfter(day, startOfDay(maxDate))) return true;
//     return false;
//   }, [minDate, maxDate]);

//   const handleDayClick = useCallback((day) => {
//     if (isDateDisabled(day)) return;
//     const utcDay = utc ? getUTCDate(day) : day;

//     if (range) {
//       if (rangeStep === 'start') {
//         setSelected({ from: utcDay, to: null });
//         setRangeStep('end');
//         setLiveRegionText(`Start date selected: ${formatDate(utcDay, 'PPP', { locale })}`);
//       } else { // rangeStep is 'end'
//         if (isBefore(utcDay, selected.from)) {
//           // New start date selected
//           setSelected({ from: utcDay, to: null });
//           setLiveRegionText(`Start date selected: ${formatDate(utcDay, 'PPP', { locale })}`);
//         } else {
//           // Valid end date selected
//           const fromISO = selected.from.toISOString();
//           const toISO = utcDay.toISOString();
//           emitChange([fromISO, toISO]);
//           setLiveRegionText(`Date range selected: ${formatDate(selected.from, 'PPP', { locale })} to ${formatDate(utcDay, 'PPP', { locale })}`);
//           setIsOpen(false);
//         }
//       }
//     } else { // Single mode
//       emitChange(utcDay.toISOString());
//       setLiveRegionText(`Date selected: ${formatDate(utcDay, 'PPP', { locale })}`);
//       setIsOpen(false);
//     }
//   }, [range, rangeStep, selected.from, isDateDisabled, utc, emitChange, locale]);

//   const handleManualInputChange = useCallback((e) => {
//     const str = e.target.value;
//     setInputValue(str);
//     if (!str) {
//       emitChange(range ? [null, null] : null);
//       return;
//     }
//     // Simple parsing, more robust logic can be added
//     const parsed = parse(str, displayFormat, new Date(), { locale });
//     if (isValid(parsed) && !isDateDisabled(parsed)) {
//       handleDayClick(parsed);
//     }
//   }, [displayFormat, locale, range, emitChange, isDateDisabled, handleDayClick]);

//   const handleClear = useCallback((e) => {
//     e.stopPropagation();
//     setInputValue('');
//     emitChange(range ? [null, null] : null);
//   }, [range, emitChange]);

//   // --- Effects ---
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     if (isOpen) {
//       onCalendarOpen?.();
//       document.addEventListener('mousedown', handleClickOutside);
//     } else {
//       onCalendarClose?.();
//       // On close, if a range is incomplete, clear it.
//       if (range && selected.from && !selected.to) {
//         emitChange([null, null]);
//       }
//     }
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isOpen, onCalendarOpen, onCalendarClose, range, selected.from, selected.to, emitChange]);

//   const { from, to } = selected;
//   const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }), [month]);

//   return (
//     <div ref={wrapperRef} className={clsx('df-wrapper', className)}>
//       <style>{calendarStyles}</style>
//       <div className="df-input-wrapper">
//         {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>}
//         <input
//           id={name} name={name} type="text" value={displayValue}
//           onChange={allowManualInput ? handleManualInputChange : undefined}
//           onFocus={() => !disabled && setIsOpen(true)}
//           readOnly={!allowManualInput} placeholder={placeholder || 'Select date'}
//           disabled={disabled} required={required} className="df-input" autoComplete="off"
//           aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined}
//         />
//         <CalendarIcon className="df-input-icon h-5 w-5" />
//         {displayValue && !disabled && (
//           <button type="button" onClick={handleClear} className="df-clear-btn" aria-label="Clear date">
//             <X className="h-4 w-4" />
//           </button>
//         )}
//       </div>

//       {isOpen && !disabled && (
//         <div className="df-popup" style={{ top: 'calc(100% + 4px)', left: 0 }} role="dialog" aria-modal="true" aria-label="Calendar">
//           {showQuickRanges && range && (
//             <div className="df-quick-ranges">
//               {Object.entries(quickRanges).map(([key, [start, end]]) => (
//                 <button
//                   key={key} type="button" className="df-quick-range-btn"
//                   onClick={() => {
//                     emitChange([start.toISOString(), end.toISOString()]);
//                     setIsOpen(false);
//                   }}
//                 >{key}</button>
//               ))}
//             </div>
//           )}
//           <div className="df-calendar">
//             <div className="df-header">
//               <button type="button" className="df-nav-btn" onClick={() => setMonth(subMonths(month, 1))} aria-label="Previous month" disabled={minDate && isBefore(startOfMonth(month), startOfMonth(minDate))}><ChevronLeft className="h-5 w-5" /></button>
//               <h3 aria-live="polite">{formatDate(month, 'MMMM yyyy', { locale })}</h3>
//               <button type="button" className="df-nav-btn" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month" disabled={maxDate && isAfter(startOfMonth(month), startOfMonth(maxDate))}><ChevronRight className="h-5 w-5" /></button>
//             </div>
//             <CalendarGrid
//               month={month} from={from} to={to} hoveredDate={hoveredDate}
//               onDayClick={handleDayClick} onDayHover={setHoveredDate}
//               isDateDisabled={isDateDisabled} locale={locale}
//               showOutsideDays={showOutsideDays} range={range}
//             />
//           </div>
//         </div>
//       )}

//       {error && <p id={`${name}-error`} className="text-red-600 text-sm mt-1">{error}</p>}
//       <div className="df-live-region" aria-live="assertive">{liveRegionText}</div>
//     </div>
//   );
// };

// const CalendarGrid = React.memo(({ month, from, to, hoveredDate, onDayClick, onDayHover, isDateDisabled, locale, showOutsideDays, range }) => {
//   const days = useMemo(() => {
//     const start = startOfMonth(month);
//     const end = endOfMonth(month);
//     // Pad the grid to always show 6 weeks for consistent height
//     const startDate = subDays(start, getDay(start));
//     const endDate = addDays(startDate, 41);
//     return eachDayOfInterval({ start: startDate, end: endDate });
//   }, [month]);

//   const weekdays = useMemo(() => eachDayOfInterval({ start: days[0], end: days[6] }).map(d => formatDate(d, 'EEEEE', { locale })), [days, locale]);

//   return (
//     <div className="df-grid">
//       {weekdays.map((day) => <div key={day} className="df-weekday" aria-hidden="true">{day}</div>)}
//       {days.map((day) => {
//         const isCurrentMonth = day.getMonth() === month.getMonth();
//         if (!showOutsideDays && !isCurrentMonth) {
//           return <div key={day.toISOString()} className="w-9 h-9" />;
//         }

//         const isRangeSelection = range && from && !to;
//         const isInRange = from && to && isWithinInterval(day, { start: from, end: to });
//         const isInPreview = isRangeSelection && hoveredDate && isWithinInterval(day, { start: from, end: hoveredDate });

//         return (
//           <div
//             key={day.toISOString()}
//             className={clsx('df-day-wrapper', {
//               'is-in-range': isInRange,
//               'is-in-preview': isInPreview,
//               'is-range-start': from && isSameDay(day, from),
//               'is-range-end': to && isSameDay(day, to),
//               'is-preview-anchor': isRangeSelection,
//             })}
//           >
//             <button
//               type="button"
//               onClick={() => onDayClick(day)}
//               onMouseEnter={() => isRangeSelection && onDayHover(day)}
//               disabled={isDateDisabled(day)}
//               className={clsx('df-day-btn', {
//                 'is-outside': !isCurrentMonth,
//                 'is-today': isSameDay(day, getUTCToday()),
//                 'is-selected': (from && isSameDay(day, from)) || (to && isSameDay(day, to)),
//                 'range-preview': isInPreview, // For compatibility
//               })}
//               aria-pressed={(from && isSameDay(day, from)) || (to && isSameDay(day, to))}
//               aria-label={formatDate(day, 'PPP', { locale })}
//             >
//               <span>{formatDate(day, 'd')}</span>
//             </button>
//           </div>
//         );
//       })}
//     </div>
//   );
// });

// export default DateField;

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useField } from 'formik';
import clsx from 'clsx';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  format,
  isSameDay,
  startOfMonth,
  startOfDay,
  startOfWeek,
  endOfMonth,
  addMonths,
  subMonths,
  addDays,
  subDays,
  isValid,
  parseISO,
  isBefore,
  isAfter,
  isWithinInterval,
  eachDayOfInterval,
  getDay,
} from 'date-fns';
import { enUS } from 'date-fns/locale';

/* -------------------------------------------------- */
/* 1.  Airbnb / Google style  (copied from your file) */
/* -------------------------------------------------- */
const calendarStyles = `
  :root {
    --df-bg: #ffffff;
    --df-text: #111827;
    --df-text-muted: #6b7280;
    --df-border: #d1d5db;
    --df-primary: #111827;
    --df-primary-text: #ffffff;
    --df-hover-bg: #f3f4f6;
    --df-range-bg: #f3f4f6;
    --df-disabled-text: #9ca3af;
    --df-radius-lg: 0.75rem;
    --df-radius-md: 0.5rem;
    --df-radius-full: 9999px;
    --df-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  .df-wrapper { position: relative; width: 100%; }
  .df-input-wrapper { position: relative; }

  .df-input {
    width: 100%;
    padding: 0.625rem 2.75rem 0.625rem 0.75rem;
    border: 1px solid var(--df-border);
    border-radius: var(--df-radius-md);
    background-color: var(--df-bg);
    color: var(--df-text);
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .df-input:focus {
    outline: none;
    border-color: var(--df-primary);
    box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
  }
  .df-input[disabled] { background-color: #f9fafb; cursor: not-allowed; }
  .df-input::placeholder { color: var(--df-text-muted); }

  .df-input-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0.75rem; /* Default position */
    color: var(--df-text-muted);
    pointer-events: none;
    transition: right 0.2s ease; /* ADDED: Transition for smoother movement */
  }
  /* ADDED: Adjust icon position when clear button is active (i.e., when input has a value) */
  .df-input-wrapper.has-value .df-input-icon {
    right: 2.5rem;
  }

  .df-clear-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0.75rem; /* CHANGED from 2.5rem to 0.75rem to align it properly next to the icon */
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--df-radius-full);
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
  }
  .df-clear-btn:hover { background-color: var(--df-hover-bg); color: var(--df-text); }

  /* The original clear button positioning was causing the skew.
     I've adjusted the clear button to be at the far right (0.75rem)
     and the icon to be at 2.5rem when the clear button is active.
     This ensures the button is still the furthest element.

     WAIT: Reverting .df-clear-btn right to 2.5rem and fixing the input padding
     is the standard approach. Let's fix the input padding instead
     to ensure everything fits correctly and the icon doesn't look skewed.

     I will revert .df-clear-btn right to 2.5rem and ensure .df-input
     padding is large enough, and then adjust icon.
  */

  .df-clear-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 2.5rem; /* REVERTED to original */
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--df-radius-full);
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
  }


  .df-popup {
    position: absolute;
    z-index: 50;
    display: flex;
    background-color: var(--df-bg);
    border: 1px solid #e5e7eb;
    border-radius: var(--df-radius-lg);
    box-shadow: var(--df-shadow);
    overflow: hidden;
    flex-direction: column;
    width: 295px;
    top: calc(100% + 4px);
    left: 0;
  }
  /* ADDED: Class for opening the calendar pop-up above the input */
  .df-popup.open-top {
    top: auto;
    bottom: calc(100% + 4px);
  }
  @media (min-width: 500px) {
    .df-popup:not(.range-mode) .df-quick-ranges {
    flex-direction: column;
    border-bottom: none;
    border-right: 1px solid #e5e7eb;
    width: 140px;
    padding: 0.75rem;
    justify-content: flex-start;
  }
  }

  .df-quick-ranges {
    padding: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.25rem;
    justify-content: center;
  }
  @media (min-width: 500px) {
    .df-quick-ranges {
      flex-direction: column;
      flex-wrap: nowrap;
      border-bottom: none;
      border-right: 1px solid #e5e7eb;
      width: 140px;
      padding: 0.75rem;
      justify-content: flex-start;
    }
  }

  .df-quick-range-btn {
    padding: 0.375rem 0.75rem;
    border: none;
    background-color: transparent;
    border-radius: var(--df-radius-md);
    text-align: left;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--df-text);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .df-popup.range-mode .df-quick-ranges {
  flex-direction: row !important;
  flex-wrap: wrap;
  border-right: none !important;
  border-bottom: 1px solid #e5e7eb;
  width: 100% !important;
  padding: 0.75rem !important;
  justify-content: center;
}

  .df-quick-range-btn:hover { background-color: var(--df-hover-bg); }

  .df-calendar { padding: 0.5rem; }
  .df-header { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.25rem; }
  .df-header h3 { font-size: 0.875rem; font-weight: 600; text-align: center; flex-grow: 1; }

  .df-nav-btn {
    display: flex; align-items: center; justify-content: center;
    width: 2rem; height: 2rem; border: none; background-color: transparent;
    border-radius: var(--df-radius-full); cursor: pointer; color: var(--df-text-muted);
    transition: background-color 0.2s ease, color 0.2s ease;
  }
  .df-nav-btn:hover:not([disabled]) { background-color: var(--df-hover-bg); color: var(--df-text); }
  .df-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .df-grid { display: grid; grid-template-columns: repeat(7, 1fr); justify-items: center; }
  .df-weekday {
    font-size: 0.75rem; font-weight: 500; color: var(--df-text-muted); width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
  }

  .df-day-btn {
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    border-radius: var(--df-radius-full); border: none; background-color: transparent;
    cursor: pointer; font-size: 0.875rem; position: relative; z-index: 1;
    transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
  }
  .df-day-btn:active:not([disabled]) { transform: scale(0.95); }

  .df-day-btn.is-outside { color: var(--df-text-muted); }
  .df-day-btn[disabled] { color: var(--df-disabled-text); cursor: not-allowed; text-decoration: line-through; }
  .df-day-btn.is-today span { border-bottom: 2px solid var(--df-primary); }

  .df-day-wrapper { position: relative; }
  .df-day-wrapper:before, .df-day-wrapper:after {
    content: ''; position: absolute; top: 0; bottom: 0; width: 50%;
    background-color: transparent; z-index: 0;
  }
  .df-day-wrapper.is-in-range:before { left: 0; }
  .df-day-wrapper.is-in-range:after { right: 0; }
  .df-day-wrapper.is-range-start:after, .df-day-wrapper.is-range-end:before { background-color: var(--df-range-bg); }
  .df-day-wrapper.is-in-range:not(.is-range-start):not(.is-range-end) .df-day-btn { background-color: var(--df-range-bg); border-radius: 0; }

  .df-day-wrapper.is-in-preview:before { left: 0; }
  .df-day-wrapper.is-in-preview:after { right: 0; }
  .df-day-wrapper.is-range-start.is-preview-anchor:after { background-color: #f9fafb; }
  .df-day-wrapper.is-in-preview:not(.is-range-start) .df-day-btn { background-color: #f9fafb; border-radius: 0; }

  .df-day-btn.is-selected {
    background-color: var(--df-primary); color: var(--df-primary-text);
  }
  .df-day-btn.is-selected:hover { background-color: #374151; }

  .df-live-region {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;
  }
`;

/* -------------------------------------------------- */
/* 2.  Helpers                                        */
/* -------------------------------------------------- */
const getUTCToday = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
};
const getUTCDate = (d) =>
  d && isValid(d) ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) : null;

const quickRanges = {
  Today: [getUTCToday(), getUTCToday()],
  Yesterday: [addDays(getUTCToday(), -1), addDays(getUTCToday(), -1)],
  'Last 7 Days': [addDays(getUTCToday(), -6), getUTCToday()],
  'This Month': [startOfMonth(getUTCToday()), endOfMonth(getUTCToday())],
};

/* -------------------------------------------------- */
/* 3.  Component                                      */
/* -------------------------------------------------- */
const DateField = ({
  name,
  label,
  className,
  disabled = false,
  value,
  onChange,
  range = true,
  minDate: minDateProp = null,
  maxDate: maxDateProp = null,
  placeholder = 'Date',
  required = false,
  error: errorProp = null,
  format: displayFormat = 'MMM dd, yyyy',
  locale = enUS,
  allowManualInput = true,
  utc = true,
  showQuickRanges = true,
  showOutsideDays = true,
  preventPastDates = false,
  preventFutureDates = false,
}) => {
  const isFormik = !!name;
  const [field, meta, helpers] = isFormik ? useField(name) : [{}, {}, {}];

  /* ---------- state ---------- */
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState({ from: null, to: null });
  const [rangeStep, setRangeStep] = useState('start');
  const [hovered, setHovered] = useState(null);
  /* ADDED: State for controlling pop-up direction */
  const [openDirection, setOpenDirection] = useState('bottom');

  const wrapperRef = useRef(null);
  /* ADDED: Ref to the input element to measure position */
  const inputRef = useRef(null);

  /* ---------- derived constraints ---------- */
  const minDate = useMemo(() => {
    const today = getUTCToday();
    const candidates = [];
    if (preventPastDates) candidates.push(today);
    if (minDateProp) candidates.push(getUTCDate(minDateProp));
    return candidates.length ? candidates.reduce((a, b) => (isAfter(a, b) ? a : b)) : null;
  }, [preventPastDates, minDateProp]);

  const maxDate = useMemo(() => {
    const today = getUTCToday();
    const candidates = [];
    if (preventFutureDates) candidates.push(today);
    if (maxDateProp) candidates.push(getUTCDate(maxDateProp));
    return candidates.length ? candidates.reduce((a, b) => (isBefore(a, b) ? a : b)) : null;
  }, [preventFutureDates, maxDateProp]);

  /* ---------- sync external -> internal ---------- */
  useEffect(() => {
    const raw = isFormik ? field.value : value;
    const parseExternal = (v) => (typeof v === 'string' ? parseISO(v) : v);
    const from = parseExternal(range ? raw?.[0] : raw);
    const to = parseExternal(range ? raw?.[1] : null);
    setSelected({ from: isValid(from) ? getUTCDate(from) : null, to: isValid(to) ? getUTCDate(to) : null });
    setRangeStep('start');
    setMonth(isValid(from) ? from : getUTCToday());
  }, [isFormik, field.value, value, range]);

  /* ---------- emit ---------- */
  const emit = useCallback(
    (from, to) => {
      const fmt = (d) => (d && isValid(d) ? d.toISOString() : null);
      const payload = range ? [fmt(from), fmt(to)] : fmt(from);
      if (isFormik) helpers.setValue(payload);
      else onChange?.(payload);
    },
    [range, isFormik, helpers, onChange]
  );

  /* ---------- disabled check ---------- */
  const isDisabled = useCallback(
    (d) => {
      const day = startOfDay(d);
      if (minDate && isBefore(day, startOfDay(minDate))) return true;
      if (maxDate && isAfter(day, startOfDay(maxDate))) return true;
      return false;
    },
    [minDate, maxDate]
  );

  /* ---------- click / hover ---------- */
  const handleDayClick = useCallback(
    (day) => {
      if (isDisabled(day)) return;
      const utcDay = getUTCDate(day);
      if (range) {
        if (rangeStep === 'start') {
          setSelected({ from: utcDay, to: null });
          setRangeStep('end');
        } else {
          if (isBefore(utcDay, selected.from)) {
            setSelected({ from: utcDay, to: null });
          } else {
            setSelected({ from: selected.from, to: utcDay });
            setRangeStep('start');
            setOpen(false);
            emit(selected.from, utcDay);
          }
        }
      } else {
        setSelected({ from: utcDay, to: null });
        setOpen(false);
        emit(utcDay);
      }
    },
    [range, rangeStep, selected.from, isDisabled, emit]
  );

  const handleQuick = ([f, t]) => {
    const from = getUTCDate(f);
    const to = getUTCDate(t);
    setSelected({ from, to });
    setRangeStep('start');
    setOpen(false);
    emit(from, to);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInputValue('');
    setSelected({ from: null, to: null });
    emit(null, null); // Ensure range mode clears both
  };

  /* ---------- manual input ---------- */
  const displayValue = useMemo(() => {
    if (allowManualInput && inputValue) return inputValue;
    const { from, to } = selected;
    if (range) {
      if (from && to) return `${format(from, displayFormat, { locale })} – ${format(to, displayFormat, { locale })}`;
      if (from) return `${format(from, displayFormat, { locale })} – …`;
    } else if (from) {
      return format(from, displayFormat, { locale });
    }
    return '';
  }, [allowManualInput, inputValue, selected, displayFormat, locale, range]);

  const handleInputChange = allowManualInput
    ? (e) => {
      const str = e.target.value;
      setInputValue(str);
      if (!str) return emit(null, null); // Ensure range mode clears both
      const parsed = parseISO(str);
      if (isValid(parsed) && !isDisabled(parsed)) handleDayClick(parsed);
    }
    : undefined;

  /* ---------- outside click & positioning logic ---------- */
  const checkOpenDirection = useCallback(() => {
    if (!inputRef.current) return;

    // Check if the pop-up would overflow the bottom of the viewport
    const viewportHeight = window.innerHeight;
    const inputRect = inputRef.current.getBoundingClientRect();
    // Approximate calendar height (295px width, approx 350px height)
    const calendarHeight = 350;

    // Space available below the input
    const spaceBelow = viewportHeight - inputRect.bottom;

    if (spaceBelow < calendarHeight && inputRect.top > calendarHeight) {
      // Not enough space below, but enough space above
      setOpenDirection('top');
    } else {
      // Enough space below, or not enough space above, default to bottom
      setOpenDirection('bottom');
    }
  }, []);

  useEffect(() => {
    const outside = (e) => wrapperRef.current && !wrapperRef.current.contains(e.target) && setOpen(false);
    if (open) {
      document.addEventListener('mousedown', outside);
      /* ADDED: Check direction when opening */
      checkOpenDirection();
    }
    return () => document.removeEventListener('mousedown', outside);
  }, [open, checkOpenDirection]);

  /* ---------- grid data ---------- */
  const gridDays = useMemo(() => {
    const start = startOfMonth(month);
    const padStart = subDays(start, getDay(start));
    return eachDayOfInterval({ start: padStart, end: addDays(padStart, 41) });
  }, [month]);

  const weekdays = useMemo(() => eachDayOfInterval({ start: gridDays[0], end: addDays(gridDays[0], 6) }).map((d) => format(d, 'EEEEE', { locale })), [gridDays, locale]);

  /* ---------- render ---------- */
  const error = isFormik ? meta.error : errorProp;
  /* ADDED: Check if there's a value for CSS class for icon adjustment */
  const hasValue = !!displayValue;

  return (
    <div ref={wrapperRef} className={clsx('df-wrapper', className)}>
      <style>{calendarStyles}</style>

      {/* ---- input ---- */}
      {/* MODIFIED: Add has-value class for icon positioning fix */}
      <div className={clsx("df-input-wrapper", { 'has-value': hasValue })}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && ' *'}
          </label>
        )}
        <input
          ref={inputRef} /* ADDED: Attach ref to input for positioning check */
          id={name}
          name={name}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => !disabled && setOpen(true)}
          readOnly={!allowManualInput}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="df-input"
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <CalendarIcon className="df-input-icon h-5 w-5" />
        {/* MODIFIED: Use hasValue instead of displayValue to match the class logic */}
        {hasValue && !disabled && (
          <button type="button" onClick={handleClear} className="df-clear-btn" aria-label="Clear date">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ---- popup ---- */}
      {open && !disabled && (
        <div
          /* MODIFIED: Add openDirection class and range-mode class */
          className={clsx('df-popup', { 'range-mode': range, 'open-top': openDirection === 'top' })}
          role="dialog"
          aria-modal="true"
          aria-label="Calendar"
        >
          {showQuickRanges && range && (
            <div className="df-quick-ranges">
              {Object.entries(quickRanges).map(([k, [f, t]]) => (
                <button key={k} type="button" className="df-quick-range-btn" onClick={() => handleQuick([f, t])}>
                  {k}
                </button>
              ))}
            </div>
          )}

          <div className="df-calendar">
            {/* month nav */}
            <div className="df-header">
              <button
                type="button"
                className="df-nav-btn"
                onClick={() => setMonth((m) => subMonths(m, 1))}
                disabled={minDate && isBefore(startOfMonth(month), startOfMonth(minDate))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 aria-live="polite">{format(month, 'MMMM yyyy', { locale })}</h3>
              <button
                type="button"
                className="df-nav-btn"
                onClick={() => setMonth((m) => addMonths(m, 1))}
                disabled={maxDate && isAfter(startOfMonth(month), startOfMonth(maxDate))}
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* weekdays */}
            <div className="df-grid">
              {weekdays.map((d) => (
                <div key={d} className="df-weekday" aria-hidden="true">
                  {d}
                </div>
              ))}

              {/* days */}
              {gridDays.map((day) => {
                const isCur = day.getMonth() === month.getMonth();
                if (!showOutsideDays && !isCur) return <div key={day.toISOString()} className="w-9 h-9" />;

                const isSel = (selected.from && isSameDay(day, selected.from)) || (selected.to && isSameDay(day, selected.to));
                const inRange = range && selected.from && selected.to && isWithinInterval(day, { start: selected.from, end: selected.to });
                const inPreview = range && selected.from && !selected.to && hovered && isWithinInterval(day, { start: selected.from, end: hovered });

                return (
                  <div
                    key={day.toISOString()}
                    className={clsx('df-day-wrapper', {
                      'is-in-range': inRange,
                      'is-in-preview': inPreview,
                      'is-range-start': selected.from && isSameDay(day, selected.from),
                      'is-range-end': selected.to && isSameDay(day, selected.to),
                    })}
                    onMouseEnter={() => range && selected.from && !selected.to && setHovered(day)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <button
                      type="button"
                      onClick={() => handleDayClick(day)}
                      disabled={isDisabled(day)}
                      className={clsx('df-day-btn', {
                        'is-outside': !isCur,
                        'is-today': isSameDay(day, getUTCToday()),
                        'is-selected': isSel,
                      })}
                      aria-pressed={isSel}
                      aria-label={format(day, 'PPP', { locale })}
                    >
                      <span>{format(day, 'd')}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p id={`${name}-error`} className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default DateField;