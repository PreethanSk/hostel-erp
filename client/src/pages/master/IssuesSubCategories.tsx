import MasterCrudPage from '../../components/shared/MasterCrudPage';
import {
  getMasterIssueCategory,
  getMasterIssueSubCategory,
  insertUpdateMasterIssueSubCategory,
  deleteMasterIssueSubCategory,
} from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Issue Sub-Categories"
      description="Manage issue sub-category classifications"
      pageAccess={PageAccess}
      formFields={[
        {
          name: 'issueId',
          label: 'Issue Category',
          required: true,
          type: 'select',
          loadMenuItems: () =>
            getMasterIssueCategory().then((resp) =>
              (resp?.data?.result || [])
                .filter((item: any) => item.isActive)
                .map((item: any) => ({ value: item.id, label: item.issueType }))
            ),
        },
        { name: 'subCategoryName', label: 'Sub-Category Name', required: true, type: 'text' },
      ]}
      apiGet={getMasterIssueSubCategory}
      apiSave={insertUpdateMasterIssueSubCategory}
      apiDelete={deleteMasterIssueSubCategory}
      exportFileName="Issue Sub-Category"
      exportHeaders={['S. No', 'Issue Type', 'Sub-Category', 'Status']}
      exportRowMapper={(item: any, i: number) => [
        i + 1,
        item.issueType || '',
        item.subCategoryName || '',
        item.isActive ? 'Active' : 'Inactive',
      ]}
    />
  );
}
