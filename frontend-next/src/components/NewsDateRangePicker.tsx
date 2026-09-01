'use client';

import dayjs, { type Dayjs } from 'dayjs';
import { Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

type NewsDateRangePickerProps = {
  fromDate: string;
  toDate: string;
  onChange: (from: string, to: string) => void;
  fullWidth?: boolean;
  stacked?: boolean;
};

const fieldSx = (fullWidth: boolean) => ({
  minWidth: fullWidth ? '100%' : 160,
  flex: fullWidth ? '1 1 100%' : '1 1 150px',
  width: fullWidth ? '100%' : undefined,
});

export default function NewsDateRangePicker({
  fromDate,
  toDate,
  onChange,
  fullWidth = false,
  stacked = false,
}: NewsDateRangePickerProps) {
  const fromValue = fromDate ? dayjs(fromDate) : null;
  const toValue = toDate ? dayjs(toDate) : null;

  const handleFromChange = (value: Dayjs | null) => {
    onChange(value ? value.format('YYYY-MM-DD') : '', toDate);
  };

  const handleToChange = (value: Dayjs | null) => {
    onChange(fromDate, value ? value.format('YYYY-MM-DD') : '');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: stacked ? 'column' : 'row',
        gap: 1,
        flexWrap: stacked || fullWidth ? 'wrap' : 'nowrap',
        ...(stacked ? { width: '100%' } : fieldSx(fullWidth)),
      }}
    >
      <DatePicker
        label="Дата от"
        value={fromValue}
        onChange={handleFromChange}
        format="DD.MM.YYYY"
        slotProps={{
          textField: {
            size: 'small',
            sx: stacked || fullWidth ? { width: '100%' } : fieldSx(fullWidth),
          },
          field: { clearable: true },
        }}
      />
      <DatePicker
        label="Дата до"
        value={toValue}
        minDate={fromValue ?? undefined}
        onChange={handleToChange}
        format="DD.MM.YYYY"
        slotProps={{
          textField: {
            size: 'small',
            sx: stacked || fullWidth ? { width: '100%' } : fieldSx(fullWidth),
          },
          field: { clearable: true },
        }}
      />
    </Box>
  );
}
