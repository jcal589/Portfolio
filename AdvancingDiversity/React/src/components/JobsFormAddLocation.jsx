import React, { useState, useEffect } from 'react';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import locationsFormSchema from '../../schema/locationsFormSchema';
import { Row, Col, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';
import locationService from '../../services/locationService';
import AddressAutoComplete from '../locations/AddressAutoComplete';
import GMap from '../locations/Gmap';
import toastr from 'toastr';
import 'toastr/build/toastr.css';

import debug from 'sabio-debug';
const _logger = debug.extend('locations');
const _loggerLocations = _logger.extend('formFields');

function JobsFormAddLocation(props) {
    const modalProps = props;
    _logger('This is modalProps', modalProps);

    const [locationPage, setLocationPage] = useState({
        formData: {
            locationTypeId: '',
            lineOne: '',
            lineTwo: '',
            city: '',
            zip: '',
            stateId: '',
            latitude: 34.082741,
            longitude: -118.316993,
        },
        hasStateId: false,
        states: [],
        locationTypes: [],
    });

    useEffect(() => {
        _logger('Rendered Locations');
        let payload = ['States', 'LocationTypes'];
        locationService.getLookups(payload).then(onGetLookupSuccess).catch(onGetLookupError);
    }, []);

    const onGetLookupSuccess = (response) => {
        _loggerLocations(response);
        setLocationPage((prevState) => {
            let newDropDown = { ...prevState };
            newDropDown.states = response.data.item.states;
            newDropDown.locationTypes = response.data.item.locationTypes;
            return newDropDown;
        });
    };

    const onGetLookupError = (response) => {
        _loggerLocations(response);
    };

    const handleSubmit = (values, onSubmitProps) => {
        _logger('this is onSubmitProps', onSubmitProps);
        _logger(values, 'These are the values for the form submit. Pass your own function that will handle the submit');
        toastr.success('Submit Registered');
        locationService.add(values).then(onAddLocationSuccess).then(onSubmitProps.resetForm).catch(OnAddLocationError);
    };

    const onAddLocationSuccess = (response) => {
        _logger(response);
        toastr.success('Location Added Successfully');
    };
    const OnAddLocationError = (error) => {
        _logger(error);
        toastr.error(error);
    };

    const mapLocationType = (locationType) => {
        return (
            <option value={locationType.id} key={`locationType_${locationType.id}`}>
                {locationType.name}
            </option>
        );
    };

    const mapState = (state) => {
        return (
            <option value={state.id} key={`state_${state.id}`}>
                {state.name}
            </option>
        );
    };

    const addressFromAuto = (addressComponents, streetAddress, coordinates) => {
        let result = {};
        for (let i = 2; i < addressComponents.length; i++) {
            const thisComponent = addressComponents[i];

            result.lineOne = streetAddress;

            if (thisComponent.types.includes('locality')) {
                result.city = thisComponent.long_name;
                continue;
            }
            if (thisComponent.types.includes('administrative_area_level_1')) {
                for (let i = 0; i < locationPage.states.length; i++) {
                    const aState = locationPage.states[i];

                    if (aState.name === thisComponent.long_name.toUpperCase()) {
                        result.stateId = aState.id;
                        break;
                    }
                }
                continue;
            }
            if (thisComponent.types.includes('postal_code')) {
                result.zip = thisComponent.long_name;
                continue;
            }
        }

        if (result.city && result.stateId && result.lineOne && result.zip)
            setLocationPage((prevState) => {
                let newLocation = { ...prevState };
                newLocation.formData = { ...prevState.formData };
                newLocation.formData.lineOne = result.lineOne;
                newLocation.formData.city = result.city;
                newLocation.formData.stateId = result.stateId;
                newLocation.formData.zip = result.zip;
                newLocation.formData.latitude = coordinates.lat;
                newLocation.formData.longitude = coordinates.lng;
                return newLocation;
            });
    };

    return (
        <>
            <Row className="m-3">
                <Col>
                    <Formik
                        enableReinitialize={true}
                        initialValues={locationPage.formData}
                        onSubmit={handleSubmit}
                        validationSchema={locationsFormSchema}>
                        {() => {
                            return (
                                <>
                                    <Card>
                                        <Card.Body>
                                            <Form style={{ position: 'relative' }}>
                                                <Row className="justify-content-center">
                                                    <GMap
                                                        coordinates={{
                                                            lat: locationPage.formData.latitude,
                                                            lng: locationPage.formData.longitude,
                                                        }}
                                                    />
                                                </Row>
                                                <Row className="mt-2">
                                                    <div className="form-group col-sm-5">
                                                        <label htmlFor="lineOne">Address 1</label>
                                                        <AddressAutoComplete addressFromAuto={addressFromAuto} />
                                                        <ErrorMessage
                                                            name="lineOne"
                                                            component="div"
                                                            className="text-danger"></ErrorMessage>
                                                    </div>
                                                    <div className="form-group col-sm-5">
                                                        <label htmlFor="lineTwo">Address 2</label>
                                                        <Field name="lineTwo" type="text" className="form-control" />
                                                        <ErrorMessage
                                                            name="lineTwo"
                                                            component="div"
                                                            className="text-danger"
                                                        />
                                                    </div>
                                                    <div className="form-group col-md-2">
                                                        <label htmlFor="locationTypeId">Address Type</label>
                                                        <Field
                                                            component="select"
                                                            className="form-control"
                                                            name="locationTypeId">
                                                            <option value=""></option>
                                                            {locationPage.locationTypes.map(mapLocationType)}
                                                        </Field>
                                                        <ErrorMessage
                                                            name="locationTypeId"
                                                            component="div"
                                                            className="text-danger"
                                                        />
                                                    </div>
                                                </Row>
                                                <Row className="mt-2">
                                                    <div className="form-group col-12 col-md-4">
                                                        <label htmlFor="city">City</label>
                                                        <Field name="city" type="text" className="form-control" />
                                                        <ErrorMessage
                                                            name="city"
                                                            component="div"
                                                            className="text-danger"
                                                        />
                                                    </div>
                                                    <div className="form-group col-12 col-md-4">
                                                        <label htmlFor="stateId">State</label>
                                                        <Field
                                                            component="select"
                                                            className="form-control"
                                                            name="stateId">
                                                            <option value=""></option>
                                                            {locationPage.states.map(mapState)}
                                                        </Field>
                                                        <ErrorMessage
                                                            name="stateId"
                                                            component="div"
                                                            className="text-danger"
                                                        />
                                                    </div>
                                                    <div className="form-group col-12 col-md-4">
                                                        <label htmlFor="zip">Zip</label>
                                                        <Field name="zip" type="text" className="form-control" />
                                                        <ErrorMessage
                                                            name="zip"
                                                            component="div"
                                                            className="text-danger"
                                                        />
                                                    </div>
                                                </Row>
                                                <Row className="mt-3 text-center">
                                                    <Col>
                                                        <button type="submit" className="btn btn-primary rounded">
                                                            <strong>Submit</strong>
                                                        </button>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </>
                            );
                        }}
                    </Formik>
                </Col>
            </Row>
        </>
    );
}

export default JobsFormAddLocation;

JobsFormAddLocation.propTypes = {
    onLocationSubmit: PropTypes.func,
};
