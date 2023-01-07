(() => {
    const lib = new PlugIn.Library(new Version("1.0"));
    const MILLISECONDS_IN_MINUTE = 60000;

    function getTotalTaskTime(tasks, form, formLib, calLib) {
        let total = 0;

        for (const task of tasks) {
            total += calLib.getDurationOrFallbackToDefault(task, form);
        }

        return total;
    }

    function isValidStatus(task) {
        return task.taskStatus !== Task.Status.Dropped 
                && task.taskStatus !== Task.Status.Completed
    };

    function meetsTimeEstimatedPreferences(
        task, 
        { values: { unestimated }}, 
        {C: {UNESTIMATED: { EVENT }}},
    ) {
        return task.estimatedMinutes 
            || (!task.estimatedMinutes && unestimated === EVENT.index);
    };

    function meetsHierarchyPreferences(
        task,
        { values: { taskHierarchy, maxDepth }},
        {C: { HIERARCHY: { ALL, DEPTH, CHILDREN }}}
    ) {
        return taskHierarchy === ALL.index
            || (taskHierarchy === CHILDREN.index && !task.hasChildren)
            || (taskHierarchy === DEPTH.index && meetsDepthRequirements(task, Number(maxDepth)));
    }

    function meetsDepthRequirements(task, maxDepth) {
        const depth = getDepth(task, maxDepth);

        return depth === maxDepth || (depth < maxDepth && !task.hasChildren);
    }

    function getDepth(task, maxDepth, index = -2) {
        let result;

        index += 1;
        
        return !task.parent
             ? index
             : getDepth(task.parent, maxDepth, index);
    }

    function isValidTask(task, form, formLib) {
        return isValidStatus(task) && meetsHierarchyPreferences(task, form, formLib);
    }

    function getProjectTasks(selection, form, formLib) {
        const tasks = new Set();

        for (const project of selection.projects) {
            for (const task of project.flattenedChildren) {
                if (isValidTask(task, form, formLib)) {
                    tasks.add(task);
                }
            }
        }

        return tasks;
    }

    function getOtherTasks(selection, form, formLib) {
        const tasks = new Set();

        for (const task of selection.tasks) {
            if (isValidTask(task, form, formLib)) {
                tasks.add(task);
            }
        }

        return tasks;
    }

    function getTagTasks(selection, form, formLib) {
        const tasks = new Set();

        for (const tag of selection.tags) {
            for (const task of tag.remainingTasks) {
                if (isValidTask(task, form, formLib)) {
                    tasks.add(task);
                }
            }
        }

        return tasks;
    }

    lib.getTaskDurationCutoff = function(tasks, form, formLib, calLib) {
        let taskDurationCutoff;

        if (formLib.C.SURPLUS.SQUASH.index === form.values.surplusBehaviour) {
            const totalTime = getTotalTaskTime(tasks, form, formLib, calLib);

            const availableTime = form.values.endDate.getTime() - form.values.startDate.getTime();

            if (totalTime > availableTime) {
                const averageTaskTime = availableTime / tasks.length;

                let availableMinusShortTasks = availableTime
                let shortTaskCount = 0;

                for (const task of tasks) {
                    const duration = task.estimatedMinutes
                        ? Number(task.estimatedMinutes) * MILLISECONDS_IN_MINUTE
                        : Number(form.values.defaultDuration) * MILLISECONDS_IN_MINUTE;

                    if (duration < averageTaskTime) {
                        availableMinusShortTasks -= duration;
                        shortTaskCount += 1;
                    }
                }

                taskDurationCutoff = availableMinusShortTasks / (tasks.length - shortTaskCount);
            }
        }

        return taskDurationCutoff;
    }

    function getAllTasks(selection, form, formLib) {
        const s = new Set([
            ...getProjectTasks(selection, form, formLib),
            ...getTagTasks(selection, form, formLib),
            ...getOtherTasks(selection, form, formLib)
        ]);

        return [...s.values()];
    }

    lib.getTasks = (selection, form, formLib) => {
        const tasks = getAllTasks(selection, form, formLib);

        return tasks.filter((task) => meetsTimeEstimatedPreferences(task, form, formLib));
        
    }

    lib.getUnestimatedTasks = (selection, form, formLib) => {
        const tasks = getAllTasks(selection, form, formLib);

        return tasks.filter((task) => !task.estimatedMinutes);
    }

    return lib;
})();