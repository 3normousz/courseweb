import { format, isSameDay } from 'date-fns';
import { FC, PropsWithChildren, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarEvent, DisplayCalendarEvent } from './calendar.types';
import { Button } from '@/components/ui/button';
import { Delete, Edit, Trash, X } from 'lucide-react';
import { PopoverClose } from '@radix-ui/react-popover';
import { UpdateType, useCalendar } from './calendar_hook';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DialogClose, DialogDescription } from '@radix-ui/react-dialog';
import { AddEventButton } from './AddEventButton';

const ConfirmDeleteEvent:FC<{ event: CalendarEvent }> = ({ event }) => {
    const { removeEvent } = useCalendar();

    return <Dialog>
        <DialogTrigger asChild>
            <Button size="icon" variant='ghost'>
                <Trash className='w-4 h-4' />
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogDescription>
                    <p>確定要刪除這個事件嗎？</p>
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                </DialogClose>
                <Button variant="destructive" onClick={_ => removeEvent(event)}>刪除</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

const UpdateRepeatedEventDialog: FC<{ open: boolean, onClose: (type?: UpdateType) => void }> = ({ open, onClose }) => {
    return <Dialog open={open} onOpenChange={v => {if(!v) onClose()}}>
        <DialogTrigger asChild>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>更新重複事件</DialogTitle>
                <DialogDescription>
                    <p>您要更新所有重複事件還是只更新這個事件？</p>
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                </DialogClose>
                <Button onClick={_ => onClose(UpdateType.THIS)}>只更新這個事件</Button>
                <Button onClick={_ => onClose(UpdateType.ALL)}>所有</Button>
                <Button onClick={_ => onClose(UpdateType.FOLLOWING)}>這個和之後的事件</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

export const EventPopover: FC<PropsWithChildren<{ event: DisplayCalendarEvent; }>> = ({ children, event }) => {
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [waitingUpdateEvent, setWaitingUpdateEvent] = useState<CalendarEvent | null>(null);
    const { updateEvent } = useCalendar();

    const handleEventAdded = (newEvent: CalendarEvent) => {
        if(!event.repeat) updateEvent({
            ...newEvent,
        });
        else {
            setUpdateDialogOpen(true);
            setWaitingUpdateEvent(newEvent);
        }
    }

    const handleRepeatedEventUpdate = (type?: UpdateType) => {
        if(!type) return;
        if(waitingUpdateEvent) updateEvent(waitingUpdateEvent, type);
        setUpdateDialogOpen(false);
    }


    return <Popover>
        <PopoverTrigger asChild>
            {children}
        </PopoverTrigger>
        <PopoverContent className='p-1'>
            <UpdateRepeatedEventDialog open={updateDialogOpen} onClose={handleRepeatedEventUpdate} />
            <div className='flex flex-col'>
                <div className='flex flex-row justify-end'>
                    <AddEventButton defaultEvent={{ ...event, start: event.displayStart, end: event.displayEnd }} onEventAdded={handleEventAdded}>
                        <Button size="icon" variant='ghost'>
                            <Edit className='w-4 h-4' />
                        </Button>
                    </AddEventButton>
                    <ConfirmDeleteEvent event={event}/>
                    <PopoverClose asChild>
                        <Button size="icon" variant='ghost'>
                            <X className='w-4 h-4' />
                        </Button>
                    </PopoverClose>
                </div>
                <div className='flex flex-row gap-1 px-2 pb-4'>
                    <div className='w-6 py-1'>
                        <div className='w-4 h-4 rounded-full' style={{ background: event.color }}></div>
                    </div>
                    <div className='flex flex-col gap-1 flex-1'>
                        <h1 className='text-xl font-semibold'>{event.title}</h1>
                        {event.allDay ? <p className='text-sm text-slate-500'>{format(event.displayStart, 'yyyy-M-d')} - {format(event.displayEnd, 'yyyy-M-d')}</p> :
                            isSameDay(event.start, event.end) ?
                                <p className='text-sm text-slate-500'>{format(event.displayStart, 'yyyy-M-d')} ⋅ {format(event.displayStart, 'HH:mm')} - {format(event.displayEnd, 'HH:mm')}</p> :
                                <p className='text-sm text-slate-500'>{format(event.displayStart, 'yyyy-M-d HH:mm')} - {format(event.displayEnd, 'yyyy-LL-dd HH:mm')}</p>}
                        <p className='text-sm text-slate-500'>{event.details}</p>
                    </div>
                </div>
            </div>
        </PopoverContent>
    </Popover>;
};
