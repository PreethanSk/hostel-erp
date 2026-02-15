import MasterCrudPage from '../../components/shared/MasterCrudPage';
import { getMasterUserRole, insertUpdateMasterUserRole, deleteMasterUserRole } from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="User Roles"
      description="Manage user role definitions"
      pageAccess={PageAccess}
      formFields={[
        { name: 'roleName', label: 'Role Name', required: true, type: 'text' },
      ]}
      apiGet={getMasterUserRole}
      apiSave={insertUpdateMasterUserRole}
      apiDelete={deleteMasterUserRole}
      exportFileName="User Role"
    />
  );
}
