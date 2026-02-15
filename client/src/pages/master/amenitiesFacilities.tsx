import MasterCrudPage from '../../components/shared/MasterCrudPage';
import {
  getMasterAmenitiesSubCategory,
  getMasterAmenitiesFacilities,
  insertUpdateMasterAmenitiesFacilities,
  deleteMasterAmenitiesFacility,
} from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Amenities Facilities"
      description="Manage individual amenity facilities"
      pageAccess={PageAccess}
      formFields={[
        {
          name: 'subCategoryId',
          label: 'Sub-Category',
          required: true,
          type: 'select',
          loadMenuItems: () =>
            getMasterAmenitiesSubCategory().then((resp) =>
              (resp?.data?.result || [])
                .filter((item: any) => item.isActive)
                .map((item: any) => ({ value: item.id, label: item.subCategory }))
            ),
        },
        { name: 'facilityName', label: 'Facility Name', required: true, type: 'text' },
      ]}
      apiGet={getMasterAmenitiesFacilities}
      apiSave={insertUpdateMasterAmenitiesFacilities}
      apiDelete={deleteMasterAmenitiesFacility}
      exportFileName="Amenities Facilities"
      exportHeaders={['S. No', 'Sub-Category', 'Facility', 'Status']}
      exportRowMapper={(item: any, i: number) => [
        i + 1,
        item.subCategory || '',
        item.facilityName || '',
        item.isActive ? 'Active' : 'Inactive',
      ]}
    />
  );
}
