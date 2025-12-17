'use client';

import { useState, useCallback } from 'react';
import { mastersService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import {
    Department, Designation, AssetType, DeviceBrand, Vendor, Location, TicketCategory,
    CreateDepartmentModel, CreateDesignationModel, CreateMasterModel, CreateVendorModel, CreateLocationModel, CreateTicketCategoryModel
} from '@adminvault/shared-models';

export function useMasters() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
    const [brands, setBrands] = useState<DeviceBrand[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // Generic Fetch Helper
    const fetchMaster = useCallback(async (
        apiCall: () => Promise<any>,
        setState: (data: any[]) => void,
        errorMsg: string
    ) => {
        try {
            setIsLoading(true);
            const response = await apiCall();
            if (response.success || response.status) {
                setState(response.data || []);
            }
        } catch (error) {
            console.error(error);
            // toast.error('Error', errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // specific fetches
    const fetchDepartments = useCallback(() => fetchMaster(
        () => mastersService.getAllDepartments(),
        setDepartments,
        'Failed to fetch departments'
    ), [fetchMaster]);

    const fetchDesignations = useCallback(() => fetchMaster(
        () => mastersService.getAllDesignations(),
        setDesignations,
        'Failed to fetch designations'
    ), [fetchMaster]);

    const fetchAssetTypes = useCallback(() => fetchMaster(
        () => mastersService.getAllAssetTypes(),
        setAssetTypes,
        'Failed to fetch asset types'
    ), [fetchMaster]);

    const fetchBrands = useCallback(() => fetchMaster(
        () => mastersService.getAllBrands(),
        setBrands,
        'Failed to fetch brands'
    ), [fetchMaster]);

    const fetchVendors = useCallback(() => fetchMaster(
        () => mastersService.getAllVendors(),
        setVendors,
        'Failed to fetch vendors'
    ), [fetchMaster]);

    const fetchLocations = useCallback(() => fetchMaster(
        () => mastersService.getAllLocations(),
        setLocations,
        'Failed to fetch locations'
    ), [fetchMaster]);

    const fetchTicketCategories = useCallback(() => fetchMaster(
        () => mastersService.getAllTicketCategories(),
        setTicketCategories,
        'Failed to fetch ticket categories'
    ), [fetchMaster]);


    // Create/Delete logic follows similar pattern (omitted for brevity in prompt but implemented fully here)
    // Actually I should implement them to support the page.

    const createDepartment = async (data: CreateDepartmentModel) => {
        setIsLoading(true);
        try {
            const res = await mastersService.createDepartment(data);
            if (res.success) {
                fetchDepartments();
                return true;
            }
        } catch (e) {
            return false;
        } finally { setIsLoading(false); }
    };

    const deleteDepartment = async (id: number) => {
        setIsLoading(true);
        try {
            const res = await mastersService.deleteDepartment(id);
            if (res.success) {
                fetchDepartments();
                return true;
            }
        } catch (e) { return false; } finally { setIsLoading(false); }
    };

    // ... Implement others similarly 
    // To save tokens/time I will just expose the fetchers and data first, and create/delete for all.

    const createDesignation = async (data: CreateDesignationModel) => {
        setIsLoading(true);
        try {
            const res = await mastersService.createDesignation(data);
            if (res.success) { fetchDesignations(); return true; }
        } catch (e) { return false; } finally { setIsLoading(false); }
    };
    const deleteDesignation = async (id: number) => {
        setIsLoading(true);
        try { await mastersService.deleteDesignation(id); fetchDesignations(); return true; } catch (e) { return false; } finally { setIsLoading(false); }
    };

    const createAssetType = async (data: CreateMasterModel) => {
        setIsLoading(true);
        try {
            const res = await mastersService.createAssetType(data);
            if (res.success) { fetchAssetTypes(); return true; }
        } catch (e) { return false; } finally { setIsLoading(false); }
    };
    const deleteAssetType = async (id: number) => {
        setIsLoading(true);
        try { await mastersService.deleteAssetType(id); fetchAssetTypes(); return true; } catch (e) { return false; } finally { setIsLoading(false); }
    };

    const createBrand = async (data: CreateMasterModel) => {
        setIsLoading(true);
        try {
            const res = await mastersService.createBrand(data);
            if (res.success) { fetchBrands(); return true; }
        } catch (e) { return false; } finally { setIsLoading(false); }
    };
    const deleteBrand = async (id: number) => {
        setIsLoading(true);
        try { await mastersService.deleteBrand(id); fetchBrands(); return true; } catch (e) { return false; } finally { setIsLoading(false); }
    };

    const createVendor = async (data: CreateVendorModel) => {
        setIsLoading(true);
        try {
            const res = await mastersService.createVendor(data);
            if (res.success) { fetchVendors(); return true; }
        } catch (e) { return false; } finally { setIsLoading(false); }
    };
    const deleteVendor = async (id: number) => {
        setIsLoading(true);
        try { await mastersService.deleteVendor(id); fetchVendors(); return true; } catch (e) { return false; } finally { setIsLoading(false); }
    };

    const createLocation = async (data: CreateLocationModel) => {
        setIsLoading(true);
        try {
            const res = await mastersService.createLocation(data);
            if (res.success) { fetchLocations(); return true; }
        } catch (e) { return false; } finally { setIsLoading(false); }
    };
    const deleteLocation = async (id: number) => {
        setIsLoading(true);
        try { await mastersService.deleteLocation(id); fetchLocations(); return true; } catch (e) { return false; } finally { setIsLoading(false); }
    };

    const createTicketCategory = async (data: CreateTicketCategoryModel) => {
        setIsLoading(true);
        try {
            const res = await mastersService.createTicketCategory(data);
            if (res.success) { fetchTicketCategories(); return true; }
        } catch (e) { return false; } finally { setIsLoading(false); }
    };
    const deleteTicketCategory = async (id: number) => {
        setIsLoading(true);
        try { await mastersService.deleteTicketCategory(id); fetchTicketCategories(); return true; } catch (e) { return false; } finally { setIsLoading(false); }
    };

    return {
        departments, fetchDepartments, createDepartment, deleteDepartment,
        designations, fetchDesignations, createDesignation, deleteDesignation,
        assetTypes, fetchAssetTypes, createAssetType, deleteAssetType,
        brands, fetchBrands, createBrand, deleteBrand,
        vendors, fetchVendors, createVendor, deleteVendor,
        locations, fetchLocations, createLocation, deleteLocation,
        ticketCategories, fetchTicketCategories, createTicketCategory, deleteTicketCategory,
        isLoading
    };
}
