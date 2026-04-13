// ProjectDelivery.js

// This module tracks project deliverables and their completion status.

class ProjectDelivery {
    constructor(projectName) {
        this.projectName = projectName;
        this.deliverables = [];
    }

    addDeliverable(name, dueDate) {
        const deliverable = {
            name,
            dueDate,
            completed: false,
            completionDate: null
        };
        this.deliverables.push(deliverable);
    }

    completeDeliverable(name) {
        const deliverable = this.deliverables.find(d => d.name === name);
        if (deliverable) {
            deliverable.completed = true;
            deliverable.completionDate = new Date().toISOString();
        } else {
            throw new Error('Deliverable not found');
        }
    }

    getDeliverables() {
        return this.deliverables;
    }
}

// Example usage:
// const project = new ProjectDelivery('My Project');
// project.addDeliverable('Design Document', '2026-04-20');
// project.completeDeliverable('Design Document');
// console.log(project.getDeliverables());
