(() => {
    const action = new PlugIn.Action( function(selection) {
        (async () => {
            getUrls = (tasks, form, formLib, taskDurationCutoff) => {
                const { values: { ignoreUnestimated, startDate }} = form;

                const urls = [];
                let date = startDate;

                for (
                    let i = 0;
                    i < tasks.length && date;
                    i++
                ) {
                    const task = tasks[i];

                    if (!ignoreUnestimated 
                        || (ignoreUnestimated && task.estimatedMinutes)
                    ) {
                        const params = [task, date, form, formLib, taskDurationCutoff];
                        
                        const str = calLib.getCalStr(...params)

                        urls.push(URL.fromString(str));

                        date = calLib.getNextDate(...params);
                    }
                }

                return urls;
            }

            callUrls = (urls) => {
                const urlsIter = urls[Symbol.iterator]();

                function fetchUrl(urlsIter) {
                    const next = urlsIter.next();

                    if (!next.done) {
                        next.value.call(() => fetchUrl(urlsIter));
                    }
                }

                fetchUrl(urlsIter);
            }

            openUrls = (urls) => urls.forEach((url) => url.open());

            const formLib = this.FormLib;
            const calLib = this.CalLib;
            const taskLib = this.TaskLib;

            const form = formLib.getForm();
            await form.show(formLib.C.FORM_TITLE, formLib.C.CONFIRM_TITLE);
            
            formLib.savePreferences(form);

            const tasks = taskLib.getTasksList(selection);
            const taskDurationCutoff = taskLib.getTaskDurationCutoff(tasks, form, formLib, calLib);
            const urls = getUrls(tasks, form, formLib, taskDurationCutoff);

            const urlFn = Device.current.iOS ? callUrls : openUrls
            
            urlFn(urls);
        })().catch(err => console.error(err.message, err.stack));
    });

    action.validate = function(selection) {
        return selection.tasks.length > 0 
        || selection.projects.length > 0 
        || selection.tags.length > 0;
    }

    return action
})();
               