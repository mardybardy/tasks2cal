# Tasks2Cal

## Description

An Omnifocus plugin that allows you to transfer tasks from Omnifocus to BusyCal or Fantastical for timeblocking.

## Install

git clone this repository

`git clone https://github.com/feraleyebrows/tasks2cal Tasks2Cal.omnifocusjs`

Alternatively, download as a zip file, unarchive, and then rename the folder: 

`Tasks2Cal.omnifocusjs`

Once you have the file on your machine double click (or right click, open with... and select Omnifocus) and Omnifocus should automatically install it. 

If the plugin is not installed via the above method, you may have to drag it manually into the plug-ins folder.

If it has installed correctly, if you load Omnifocus and click 'Automation' in the menu bar you should now see 'Tasks2Cal' as one of the options in the drop down menu.

### Optional - MeetingBar

This plugin pairs really well with a free app call MeetingBar. MeetingBar will display your current or next calendar event/task in your menu bar and clicking on it will then display a drop down that reveals your entire schedule for the day. As Task2Cal transfers links and MeetingBar supports them, clicking on a task in the schedule will automatically open Omnifocus at the selected task. This makes it really quick to check things off your list as well as keeping you focussed on the tasks at hand. More information about MeetingBar can be found here:

https://meetingbar.onrender.com

## Usage

Select some tasks you want to add to you calendar. Then click 'Automation -> Tasks2Cal' in the menu bar. This should bring up a pop up window with the following options:

- Calendar App
- Start Date
- End Date
- Add as tasks (Not Events)
- Ignore unestimated fields
- Default duration
- If Total Task Duration Exceeds Time

It is advisable to add a tag to all of the tasks you want to add to your calendar, navigate to the tags perspective and then select that tag. This will allow you to move the tasks into the order you desire and the plugin should add them in this order.

One approach to acheive this is to create a parent tag 'This' and then seven child tags: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. This allows you to easily tag things with specific days by typing for example 'This: Monday' in the tag field or simply 'This' if you want to schedule it at some point this week but do not yet have a specific day in mind.

You can also repeat the above with a parent tag of 'Next' and the seven child tags for the days of the week. This allow you to plan out the next week as well as the current one. When the week ends you can enter the Tags perspective, drag any outstanding tasks across from 'This' into 'Next', rename the 'Next' tag 'This', and then rename the previous 'This' tag to 'Next'.

### Calendar App

Currently you can choose between BusyCal and Fantastical as they support adding calendar events via app URL schemes. Apple Calendar does not offer this functionality directly as far as I'm aware. 

If you use BusyCal you will only be able to use the plugin on a Mac as BusyCal currently has no URL handler on iOS. The plugin works for Fantastical on both MacOS and iOS. 

### Start and End Date

Your settings will be saved every time you run the plugin. Dates will always default to tomorrow but the time window will stay the same. For example, if you loaded the plugin for the first time on the 1st January 2023, the default selected dates would be as follows:

**Start Date: 2nd January 2023 09:00**

**End Date: 2nd January 2023 17:00**

You may then adjust those times to match your desired time window. For example:

**Start Date: 2nd January 2023 10:00**

**End Date: 2nd January 2023 16:00**

If you then loaded the plugin again the next day on the 2nd January 2023, the default selections will be:

**Start Date: 3rd January 2023 10:00**

**End Date: 3rd January 2023 16:00**

### Add as tasks (Not Events)

This will add your tasks as tasks rather than events into your calendar. There are however some drawbacks to this.

The first, is that neither BusyCal nor Fantastical will allow you to alter the duration of a task. All tasks will be added as 30 min blocks in the Calendar view. This means that short tasks will be overlapping each other and a long task will have a gap of empty time on the calendar after it. If you are adding your Omnifocus Tasks as Calendar Tasks it is therefore advisable to use List mode on BusyCal and the Tasks sidebar on Fantastical for viewing your day as it may otherwise be difficult to read.

The second disadvantage is that both Fantasical and BusyCal treat "Due Time" as "Task Start" whereas Omnifocus classes "Due Time" as "Deadline Time" or "Task End". This is because the Calendar apps are using Apple Reminders for their Task Management. In my opinion, this is problematic because a reminder is not a task, it is an alarm to do a task.

I gave thought to taking your Due Date from Omnifocus and subtracting the time estimate to get the task start time but thought better of it as you do not always (or preferably ever) want to be working on a task in the moments right before a deadline. Also you may be adding a long task that you may be working on across several days and adding a time in this manner would not allow you to timeblock it on any other day other than deadline day. 

Becuase of this, due dates are effectively ignored and your Omnifocus tasks are added to your Calendar as tasks using the same time allocation method as if they had been added as events.

### Ignore Unestimated Fields

Will ignore any selected tasks that do not have time estimates on them. Useful if you have nested tasks as you can set a time estimate on either the parent or the child tasks and the unestimated parent or child will not also be added as an event.

### Default Duration

This is how long a calendar event will last for if you have not specified a time estimate on it within Omnifocus. The value should be an integer number that represents the minutes you want to spend on the task.

### If Total Task Duration Exceeds Time.

This option allows you to specify what the plug in should do if you have selected tasks that have exceeded the allocated time window. For example, suppose you have selected the following dates:

**Start Date: 1st January 2023 09:00**

**End Date: 1st January 2023 10:00**

**Default Duration: 30 mins**

You therefore have a 1 hour window (60 minutes) of total time available for your selected tasks.

Now suppose you have selected the following tasks:

- Work out. Estimate: 60 mins.
- Shower. No Estimate.
- Eat breakfast. Estimate: 10 mins.

This is how they will play out depending on the option you choose:

#### Stop Adding Tasks When End Date Reached
```
- 09:00 to 10:00 Work Out
```

No other events will be added as all available time has been used.

#### Squash Task Durations To Fit Window
```
- 09:00 to 09:25 Work Out
- 09:25 to 09:50 Shower
- 09:50 to 10:00 Eat breakfast
```

The average time available for all all tasks is 20 minutes (60 minutes / 3 tasks).

Any tasks longer than the average will be truncated. Any tasks shorter will be unaffected.

Short tasks are subtracted from the total time.

60 minutes total - 10 minutes (eat breakfast) = 50 minutes remaining.

In this case only 'Eat Breakfast. 10 minutes' is a shorter than the average task time (20 minutes) as "Shower" has no estimate in omnifocus so it falls back to the default task duration which has been set to 30 minutes.

The remaining time is then divided by the average amount of tasks remaining:

50 minutes / 2 tasks = 25 minutes

And this is the time assigned to all tasks longer than the average (Work out, shower).

#### Continue adding tasks past end date
```
- 09:00 to 10:00 Work Out
- 10:00 to 10:30 Shower
- 10:30 to 10:45 Eat breakfast
```

This is pretty self explanatory. The end date is ignored entirely and tasks are added regardless.



