import MasterCrudPage from '../../components/shared/MasterCrudPage';
import { getMasterAmenitiesCategory, insertUpdateMasterAmenitiesCategory, deleteMasterAmenitiesCategory } from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Amenities Categories"
      description="Manage amenity category groups"
      pageAccess={PageAccess}
      formFields={[
        { name: 'name', label: 'Category Name', required: true, type: 'text' },
      ]}
      apiGet={getMasterAmenitiesCategory}
      apiSave={insertUpdateMasterAmenitiesCategory}
      apiDelete={deleteMasterAmenitiesCategory}
      exportFileName="Amenities Category"
    />
  );
}
