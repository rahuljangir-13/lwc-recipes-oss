import { buildCustomElementConstructor } from 'lwc';
import AssessmentPage from 'c/assessmentPage';

// Define the element as a custom element in the browser
customElements.define(
    'c-assessment-page',
    buildCustomElementConstructor(AssessmentPage)
);
