import { RHFCode } from './rhf-code';
import { RHFArea } from './rhf-area';
import { RHFRating } from './rhf-rating';
import { RHFSlider } from './rhf-slider';
import { RHFNumber } from './rhf-number';
import { RHFAddress } from './rhf-address';
import { RHFCaptcha } from './rhf-captcha';
import { RHFTextField } from './rhf-text-field';
import { RHFRadioGroup } from './rhf-radio-group';
import { RHFPhoneInput } from './rhf-phone-input';
import { RHFAutocomplete } from './rhf-autocomplete';
import { RHFSwitch, RHFMultiSwitch } from './rhf-switch';
import { RHFSelect, RHFMultiSelect } from './rhf-select';
import { RHFCheckbox, RHFMultiCheckbox } from './rhf-checkbox';
import { RHFUpload, RHFUploadBox, RHFUploadAvatar } from './rhf-upload';
import { RHFDatePicker, RHFTimePicker, RHFDateTimePicker } from './rhf-date-picker';
// ----------------------------------------------------------------------

export const Field = {
  Address: RHFAddress,
  Area: RHFArea,
  Select: RHFSelect,
  Switch: RHFSwitch,
  Slider: RHFSlider,
  Rating: RHFRating,
  Text: RHFTextField,
  Checkbox: RHFCheckbox,
  RadioGroup: RHFRadioGroup,
  MultiSelect: RHFMultiSelect,
  MultiSwitch: RHFMultiSwitch,
  Autocomplete: RHFAutocomplete,
  Captcha: RHFCaptcha,
  Code: RHFCode,
  MultiCheckbox: RHFMultiCheckbox,
  PhoneInput: RHFPhoneInput,
  // Pickers
  DatePicker: RHFDatePicker,
  TimePicker: RHFTimePicker,
  DateTimePicker: RHFDateTimePicker,
  Upload: RHFUpload,
  UploadAvatar: RHFUploadAvatar,
  UploadBox: RHFUploadBox,
  Number: RHFNumber,
};
