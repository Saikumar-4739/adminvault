'use client';

import { useState, useEffect, useCallback } from 'react';
import { ticketService } from '@/lib/api/services';
import { CreateTicketModel, UpdateTicketModel, DeleteTicketModel, TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum } from '@adminvault/shared-models';
import { useToast } from '@/contexts/ToastContext';

interface Ticket {
    id: number;
    ticketCode: string;
    subject: string;
    categoryEnum: TicketCategoryEnum;
    priorityEnum: TicketPriorityEnum;
    ticketStatus: TicketStatusEnum;
    employeeId: number;
    assignAdminId?: number;
    resolvedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export function useTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const fetchTickets = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await ticketService.getAllTickets();

            if (response.status) {
                const data = (response as any).tickets || response.data || [];
                // Map backend response directly to Ticket interface
                const mappedTickets: Ticket[] = data.map((item: any) => ({
                    id: item.id,
                    ticketCode: item.ticketCode,
                    subject: item.subject,
                    categoryEnum: item.categoryEnum,
                    priorityEnum: item.priorityEnum,
                    ticketStatus: item.ticketStatus,
                    employeeId: item.employeeId,
                    assignAdminId: item.assignAdminId,
                    resolvedAt: item.resolvedAt,
                    createdAt: item.createdAt || item.created_at,
                    updatedAt: item.updatedAt || item.updated_at
                }));
                setTickets(mappedTickets);
            } else {
                throw new Error(response.message || 'Failed to fetch tickets');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch tickets';
            setError(errorMessage);
            toast.error('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const createTicket = useCallback(
        async (data: CreateTicketModel) => {
            try {
                setIsLoading(true);
                const response = await ticketService.createTicket(data);

                if (response.status) {
                    await fetchTickets();
                    toast.success('Success', 'Ticket created successfully');
                    return true;
                } else {
                    const errorMsg = response.message || 'Failed to create ticket';
                    toast.error('Error', errorMsg);
                    throw new Error(errorMsg);
                }
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to create ticket';
                toast.error('Error', errorMessage);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchTickets]
    );

    const updateTicket = useCallback(
        async (data: UpdateTicketModel) => {
            try {
                setIsLoading(true);
                const response = await ticketService.updateTicket(data);

                if (response.status) {
                    await fetchTickets();
                    toast.success('Success', 'Ticket updated successfully');
                    return true;
                } else {
                    const errorMsg = response.message || 'Failed to update ticket';
                    toast.error('Error', errorMsg);
                    throw new Error(errorMsg);
                }
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to update ticket';
                toast.error('Error', errorMessage);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchTickets]
    );

    const deleteTicket = useCallback(
        async (data: DeleteTicketModel) => {
            try {
                setIsLoading(true);
                const response = await ticketService.deleteTicket(data);

                if (response.status) {
                    await fetchTickets();
                    toast.success('Success', 'Ticket deleted successfully');
                    return true;
                } else {
                    const errorMsg = response.message || 'Failed to delete ticket';
                    toast.error('Error', errorMsg);
                    throw new Error(errorMsg);
                }
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to delete ticket';
                toast.error('Error', errorMessage);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchTickets]
    );

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    return {
        tickets,
        isLoading,
        error,
        fetchTickets,
        createTicket,
        updateTicket,
        deleteTicket,
    };
}
