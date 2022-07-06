import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Row, Col, Modal, Button, Container } from 'react-bootstrap';
import jobsAdminSchema from '../../schema/jobsAdminSchema';
import debug from 'sabio-debug';
import * as jobAdminService from '../../services/jobAdminService';
import * as lookUpService from '../../services/lookupService';
import locationService from '../../services/locationService';
import JobsFormAddLocation from './JobsFormAddLocation';
import { Card, Stack } from 'react-bootstrap';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import './JobsForm.css';
import PropTypes from 'prop-types';

const _logger = debug.extend('JobsAdmin');

function JobsForm() {
    const [jobsData, setJobsData] = useState({
        mainFormData: {
            id: '',
            jobTypeId: '',
            locationId: '',
            lineOne: '',
            lineTwo: '',
            city: '',
            state: '',
            zipCode: '',
            createdBy: '',
            title: '',
            description: '',
            requirements: '',
            isActive: true,
            contactName: '',
            contactPhone: '',
            contactEmail: '',
        },
        locations: [],
        jobTypes: [],
        locationTypes: [],
        states: [],     
    });

    const [modalShow, setModalShow] = useState(false);

    useEffect(() => {
        let payload = ['JobType', 'LocationTypes', 'States'];
        lookUpService.getTypes(payload).then(onGetLookupSuccess).catch(onGetLookupError);
        locationService.getPagesLocations(0, 10).then(getPagesLocationSuccess).catch(getPagesLocationError);
    }, []);

    const getPagesLocationSuccess = (response) => {
        let returnedArray = response.data.item.pagedItems;
        let pageIndex = response.data.item.pagedIndex;
        let totalCount = response.data.item.totalCount;

        setJobsData((prevState) => {
            const locData = { ...prevState };
            locData.locations = returnedArray;
            locData.pageIndex = pageIndex;
            locData.totalCount = totalCount;
            locData.locationsMapped = locData.locations.map(mapLocation);
            _logger('This is locations', locData.locations);
            return locData;
        });
    };
    const getPagesLocationError = (error) => {
        _logger(error, 'getLocation Error');
        toastr.error(`${error}. Error retrieving locations`);
    };

    const onGetLookupSuccess = (response) => {
        setJobsData((prevState) => {
            const pd = { ...prevState };
            pd.jobTypes = response.item.jobType;
            pd.jobTypesMapped = response.item.jobType.map(mapJobTypes);

            pd.locationTypes = response.item.locationTypes;
            pd.locationTypesMapped = response.item.locationTypes.map(mapLocationTypes);

            pd.states = response.item.states;
            pd.statesMapped = response.item.states.map(mapStates);

            return pd;
        });
    };
    const onGetLookupError = (error) => {
        _logger(error, 'getJobTypes Error');
        toastr.error(`${error}. Error retrieving job types`);
    };

    const mapLocation = (location) => {
        return (
            <option value={location.id} key={`locationId_${location.id}`}>
                {location.lineOne} {location.lineTwo} {location.city} {location.state}
            </option>
        );
    };

    const mapJobTypes = (jobTypes) => {
        return (
            <option value={jobTypes.id} key={`jobTypeId_${jobTypes.id}`}>
                {jobTypes.name}
            </option>
        );
    };

    const mapLocationTypes = (locationTypes) => {
        return (
            <option value={locationTypes.id} key={`locationType_${locationTypes.id}`}>
                {locationTypes.name}
            </option>
        );
    };

    const mapStates = (states) => {
        return (
            <option value={states.id} key={`locationType_${states.id}`}>
                {states.name}
            </option>
        );
    };

    const handleSubmit = (values, onSubmitProps) => {
        _logger('Submit Registered', values);
        jobAdminService.addJob(values).then(onAddJobSuccess).then(onSubmitProps.resetForm).catch(onAddJobError);
    };

    const onAddJobSuccess = (response) => {
        _logger(response);
        toastr.success('Job Created');
    };
    const onAddJobError = (error) => {
        _logger(error);
        toastr.error(error);
    };

    const AddAddressClicked = (props) => {
        _logger('This is my AddAddressClicked Props', props);
        return (
            <Modal {...props} size="xl" onHide={handleClose} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter centered">
                        <h2 className="formTitle">Add Address</h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <JobsFormAddLocation modalProps={props}></JobsFormAddLocation>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={props.onHide} className="rounded">
                        <strong>Close</strong>
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };

    const handleClose = () => {
        setModalShow(false);
        locationService.getPagesLocations(0, 100).then(getPagesLocationSuccess).catch(getPagesLocationError);
    };

    return (
        <React.Fragment>
            <Container>
                <Formik
                    enableReinitialize={true}
                    initialValues={jobsData.mainFormData}
                    onSubmit={handleSubmit}
                    validateOnChange
                    validationSchema={jobsAdminSchema}>
                    {({ values }) => (
                        <Row className="m-3">
                            <Col xs={6} className="card p-3 me-2">
                                <Form>
                                    <div>
                                        <h3 className="formTitle">Add A Job</h3>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="jobTypeId">Job Type</label>
                                        <Field component="select" className="form-control" name="jobTypeId">
                                            <option value="">Select a Job Type</option>
                                            {jobsData.jobTypesMapped}
                                        </Field>
                                        <ErrorMessage name="jobTypeId" component="div" className="text-danger" />
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="locationId">Location</label>
                                        <div className="input-group">
                                            <Field component="select" className="form-control" name="locationId">
                                                <option value="">Select a Location</option>
                                                {jobsData.locationsMapped}
                                            </Field>
                                            <div className="input-group-addon input-group-button">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => setModalShow(true)}>
                                                    <strong>+ Address</strong>
                                                </button>
                                                <AddAddressClicked
                                                    show={modalShow}
                                                    onHide={() => setModalShow(false)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <ErrorMessage name="locationId" component="div" className="text-danger" />
                                        </div>
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="title">Title</label>
                                        <Field className="form-control" type="text" name="title" />
                                        <ErrorMessage name="title" component="div" className="text-danger" />
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="description">Description</label>
                                        <Field className="form-control" rows={2} as="textarea" name="description" />
                                        <ErrorMessage name="description" component="div" className="text-danger" />
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="requirements">Requirements</label>
                                        <Field className="form-control" rows={2} as="textarea" name="requirements" />
                                        <ErrorMessage name="requirements" component="div" className="text-danger" />
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="contactName">Contact Name</label>
                                        <Field className="form-control" type="text" name="contactName" />
                                        <ErrorMessage name="contactName" component="div" className="text-danger" />
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="contactPhone">Contact Phone (Optional)</label>
                                        <Field className="form-control" type="text" name="contactPhone" />
                                        <ErrorMessage name="contactPhone" component="div" className="text-danger" />
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="contactEmail">Contact Email (Optional)</label>
                                        <Field className="form-control" type="text" name="contactEmail" />
                                        <ErrorMessage name="contactEmail" component="div" className="text-danger" />
                                    </div>
                                    <div className="btn text-center col-md-12">
                                        <button type="submit" className="btn btn-primary rounded">
                                            <strong>Submit</strong>
                                        </button>
                                    </div>
                                </Form>
                            </Col>
                            {/* Create a new component for the preview */}
                            <Col className="card p-3">
                                <Card>
                                    <Card.Body className="pb-0">
                                        <div className="d-flex justify-content-between align-items-center mb-5">
                                            <div className="image-holder p-2 m-1">
                                                <div id="DIV_2">
                                                    <img
                                                        alt="{props.companyName} Logo"
                                                        padding="7px"
                                                        width="100"
                                                        height="auto"
                                                        src={'/static/media/logo-placeholder.97f5e276.jpg'}
                                                    />
                                                </div>
                                            </div>
                                            <Stack gap={1}>
                                                <h5>{values?.title || 'Job Title'}</h5>
                                                {/* <h5>{previewData?.title || 'Job Title'}</h5> */}
                                                <h5 className="card-title" title="Job title" name="card_title">
                                                    {values?.contactName || 'Contact Name'}
                                                </h5>
                                                {/* <h6>{aJob?.location.city || 'Error Loading City '}</h6> */}
                                                {'City Placeholder'}
                                            </Stack>
                                        </div>
                                    </Card.Body>
                                    <div className="border rounded p-2 m-1">
                                        <Stack direction="horizontal" gap={4}>
                                            <div className="details-table_row">
                                                <Stack direction="horizontal" gap={4}>
                                                    <p className="details-table_row-label" id="jobPostedLabel">
                                                        {/* {aJob?.location.city || 'Error Loading City '} */}
                                                        {'City Placeholder'}
                                                    </p>
                                                    <p className="details-table_row-value" id="jobPostedValue">
                                                        {/* {aJob?.state.code || 'Error Loading State '} */}
                                                        {'State Placeholder'}
                                                    </p>
                                                </Stack>
                                            </div>
                                            <div className="vr ms-auto" />
                                            <div className="details-table_row">
                                                <Stack direction="horizontal" gap={4}>
                                                    <p className="details-table_row-label" id="jobPostedLabel">
                                                        {/* {aJob?.dateCreated || 'Error Loading Date Posted '} */}
                                                        {'Date Placeholder'}
                                                    </p>
                                                    <p className="details-table_row-value" id="jobPostedValue">
                                                        13 days ago
                                                    </p>
                                                </Stack>
                                            </div>
                                        </Stack>
                                    </div>
                                    <Container className="jobDescriptionContainer">
                                        <div>
                                            <div>
                                                <div>
                                                    <p>
                                                        <strong>
                                                            What you need to know to be a{' '}
                                                            {/* Find way to make the name of JobType show up instead of the ID */}
                                                            {values?.jobTypeId || 'Job Type'}:
                                                        </strong>
                                                    </p>
                                                    <p>{values?.description || 'Description'}</p>
                                                    <p>Requirements:</p>
                                                    {/* <p>{aJob?.requirements || 'Error loading Job requirements'}</p> */}
                                                    <p>{values?.requirements || 'Requirements'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Container>
                                    <div className="border rounded p-2 mb-2">
                                        <ul className="list-inline mb-2">
                                            <li className="list-inline-item font-13 fw-semibold text-muted">
                                                {/* {aJob?.location.lineOne || 'Error Loading address Line 1'} */}
                                                {'1234 Hardcoded Street'}
                                            </li>
                                            <br />
                                            <li className="list-inline-item font-13 fw-semibold text-muted">
                                                {/* {aJob?.location.lineTwo || ' '} */}
                                                {'Apt Hardcoded'}
                                            </li>
                                            <br />
                                            <li className="list-inline-item font-13 fw-semibold text-muted">
                                                {/* {aJob?.location.city || 'Error Loading City '} */}
                                                {'Hardcoded Springs'}
                                            </li>
                                            <br />
                                            <li className="list-inline-item font-13 fw-semibold text-muted">
                                                {/* {aJob?.state.code || 'Error Loading State '},{' '} */}
                                                {'CA'}
                                            </li>
                                            <li className="list-inline-item font-13 fw-semibold text-muted">
                                                {/* {aJob?.location.zip || 'Error Loading Zip '} */}
                                                {'90000'}
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="border rounded p-2 mb-2">
                                        <ul className="list-inline mb-2">
                                            <li className="list-inline-item font-13 fw-semibold text-muted">
                                                {values?.contactName || 'Contact Name'}
                                            </li>
                                            <br />
                                            <li className="list-inline-item font-13 fw-semibold text-muted">
                                                {values?.contactEmail || 'Contact Email'}
                                            </li>
                                            <br />
                                            <li className="list-inline-item font-13 fw-semibold text-muted">
                                                {values?.contactPhone || 'Contact Phone Number'}
                                            </li>
                                            <p className="text-muted mb-0"></p>
                                        </ul>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Formik>
            </Container>
        </React.Fragment>
    );
}

JobsForm.propTypes = {
    resource: PropTypes.shape({
        placeholder: PropTypes.string.isRequired,
    }),
    onHide: PropTypes.func,
};

export default JobsForm;
