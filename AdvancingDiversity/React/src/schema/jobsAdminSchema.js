import * as Yup from 'yup';

const phoneRegEx = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

const jobsAdminSchema = Yup.object().shape({
    jobTypeId: Yup.number().required('A Job Type is required'),
    locationId: Yup.number().required('A Location is required'),
    title: Yup.string().min(2, 'Minimum of 2 characters required').max(200, 'Maximum of 200 characters allowed').required('A title is required'),
    description: Yup.string().min(2, 'Minimum of 2 characters required').max(1000, 'Maximum of 1000 characters allowed').required('A description is required'),
    requirements: Yup.string().min(2, 'Minimum of 2 characters required').max(1000,'Maximum of 1000 characters allowed').required('A requirement is required'),
    isActive: Yup.boolean().required(),
    contactName: Yup.string().min(2, 'Minimum of 2 characters required').max(50, 'Maximum of 50 characters allowed').required('A contact name is required'),
    contactPhone: Yup.string().matches(phoneRegEx, 'A valid phone number is required'),
    contactEmail: Yup.string().email('A valid email is required'),
});

export default jobsAdminSchema;
