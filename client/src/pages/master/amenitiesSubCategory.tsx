import MasterCrudPage from '../../components/shared/MasterCrudPage';
import {
  getMasterAmenitiesCategory,
  getMasterAmenitiesSubCategory,
  insertUpdateMasterAmenitiesSubCategory,
  deleteMasterAmenitiesSubCategory,
} from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Amenities Sub-Categories"
      description="Manage amenity sub-category groups"
      pageAccess={PageAccess}
      formFields={[
        {
          name: 'categoryId',
          label: 'Category',
          required: true,
          type: 'select',
          loadMenuItems: () =>
            getMasterAmenitiesCategory().then((resp) =>
              (resp?.data?.result || [])
                .filter((item: any) => item.isActive)
                .map((item: any) => ({ value: item.id, label: item.name }))
            ),
        },
        { name: 'subCategory', label: 'Sub-Category', required: true, type: 'text' },
      ]}
      apiGet={getMasterAmenitiesSubCategory}
      apiSave={insertUpdateMasterAmenitiesSubCategory}
      apiDelete={deleteMasterAmenitiesSubCategory}
      exportFileName="Amenities Sub-Category"
      exportHeaders={['S. No', 'Category', 'Sub-Category', 'Status']}
      exportRowMapper={(item: any, i: number) => [
        i + 1,
        item.categoryName || '',
        item.subCategory || '',
        item.isActive ? 'Active' : 'Inactive',
      ]}
    />
  );
}
