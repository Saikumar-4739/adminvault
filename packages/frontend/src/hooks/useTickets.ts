'use client';

import { useState, useEffect, useCallback } from 'react';
import { ticketService } from '@/lib/api/services';
import { CreateTicketModel, UpdateTicketModel, DeleteTicketModel, GetTicketModel } from '@adminvault/shared-models';
import { useToast } from '@/contexts/ToastContext';

interface Ticket {
    id: number;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignedTo?: number;
    createdBy?: number;
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
                const mappedTickets: Ticket[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.subject,
                    description: item.subject, // Fallback as model has no description
                    status: item.ticketStatus || item.status,
                    priority: item.priorityEnum || item.priority,
                    assignedTo: item.assignAdminId,
                    createdBy: item.employeeId,
                    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
                    updatedAt: item.updatedAt || item.updated_at
                }));
                setTickets(mappedTickets);
            } else {
                throw new Error(response.message || 'Failed to fetch tickets');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch tickets';
            setError(errorMessage);
            // toast.error('Error', errorMessage);
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
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to create ticket');
                }
            } catch (err: any) {
                // toast.error('Error', err.message || 'Failed to create ticket');
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
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to update ticket');
                }
            } catch (err: any) {
                // toast.error('Error', err.message || 'Failed to update ticket');
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
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to delete ticket');
                }
            } catch (err: any) {
                // toast.error('Error', err.message || 'Failed to delete ticket');
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
