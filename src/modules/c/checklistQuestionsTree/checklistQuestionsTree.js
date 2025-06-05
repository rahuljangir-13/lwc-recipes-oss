import { LightningElement, track } from 'lwc';
export default class ChecklistQuestionsTree extends LightningElement {
    @track menuOpen = false;
    @track areas = [
        {
            id: 'area1',
            name: 'Social Media',
            expanded: false,
            iconPath: 'M10 7l5 5-5 5z',
            questions: [
                {
                    id: 'q1',
                    label: 'Question 1',
                    text: 'Write 3 posts across platforms with branding alignment and safety standards. This must cover various marketing formats.',
                    type: 'Text',
                    sequence: 'Q1',
                    expanded: false,
                    showMore: false,
                    isEditing: false,
                    iconPath: 'M10 7l5 5-5 5z',
                    subQuestions: [
                        { id: 'sq1', label: 'Sub 1', text: 'Draft post ideas' },
                        { id: 'sq2', label: 'Sub 2', text: 'Proofread' }
                    ]
                },
                {
                    id: 'q2',
                    label: 'Question 2',
                    text: 'Review & edits',
                    type: 'Text',
                    sequence: 'Q2',
                    expanded: false,
                    showMore: false,
                    isEditing: false,
                    iconPath: 'M10 7l5 5-5 5z',
                    subQuestions: []
                }
            ]
        }
    ];

    get menuClass() {
        return this.menuOpen ? 'menu-items show' : 'menu-items';
    }

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
    }

    toggleArea(event) {
        const id = event.currentTarget.dataset.id;
        this.areas = this.areas.map((area) => {
            if (area.id === id) {
                return {
                    ...area,
                    expanded: !area.expanded,
                    iconPath: area.expanded
                        ? 'M10 7l5 5-5 5z'
                        : 'M7 10l5 5 5-5z'
                };
            }
            return area;
        });
    }

    toggleQuestion(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.map((q) => {
                    if (q.id === questionId) {
                        return {
                            ...q,
                            expanded: !q.expanded,
                            iconPath: q.expanded
                                ? 'M7 10l5 5 5-5z'
                                : 'M10 7l5 5-5 5z'
                        };
                    }
                    return q;
                });
                return { ...area, questions };
            }
            return area;
        });
    }

    toggleMore(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.map((q) => {
                    if (q.id === questionId) {
                        return { ...q, showMore: !q.showMore };
                    }
                    return q;
                });
                return { ...area, questions };
            }
            return area;
        });
    }

    startEdit(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.map((q) => {
                    if (q.id === questionId) {
                        return { ...q, isEditing: true };
                    }
                    return q;
                });
                return { ...area, questions };
            }
            return area;
        });
    }

    cancelEdit(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.map((q) => {
                    if (q.id === questionId) {
                        return { ...q, isEditing: false };
                    }
                    return q;
                });
                return { ...area, questions };
            }
            return area;
        });
    }

    saveEdit(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        // Logic to persist changes could go here
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.map((q) => {
                    if (q.id === questionId) {
                        return { ...q, isEditing: false };
                    }
                    return q;
                });
                return { ...area, questions };
            }
            return area;
        });
    }

    deleteQuestion(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.filter(
                    (q) => q.id !== questionId
                );
                return { ...area, questions };
            }
            return area;
        });
    }
}
