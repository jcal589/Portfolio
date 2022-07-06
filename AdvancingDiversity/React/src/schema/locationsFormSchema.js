import * as Yup from 'yup';

const locationsFormSchema = Yup.object().shape({
    locationTypeId: Yup.number('Address Type must be a number').required('Address type required'),
    lineOne: Yup.string().min(2, 'Address Line One must be more than 2 characters').max(255, 'Address Line One cannot exceed 255 characters').required('A valid address is required'),
    lineTwo: Yup.string().min(2, 'Address Line Two must be more than 2 characters').max(255, 'Address Line Two cannot exceed 255 characters'),
    city: Yup.string().min(2, 'City name requires 2 or more characters').max(255, 'City cannot exceed 255 characters').required('A valid city is required'),
    stateId: Yup.number('State must be a number').required('A valid state is required'),
    zip: Yup.string().min(5, 'Zip code too short').max(9, 'Zip code too long').required('A zip code is required'),
});

export default locationsFormSchema;
