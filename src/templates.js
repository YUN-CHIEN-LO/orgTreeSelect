export const EDIT_DIALOGTMP = `<script id="tmpl-edit-form-dialog" type="text/template">
<div id="edit-form-dialog">
  <form name="nform-edit" id="nform-edit">
  <div class="form-group">
      <label id="nid-edit-label" for="nid_edit">Id:</label>
      <input type="text" class="form-control" id="nid-edit" name="nid_edit" required>
      <label id="nid-edit-error" class="error" for="nid_edit"></label>
    </div>
    <div class="form-group">
      <label id="text-edit-label" for="text_edit">Text:</label>
      <input type="text" class="form-control" id="text-edit" name="text_edit" >
      <label id="text-edit-error" class="error" for="text_edit"></label>
    </div>
  </form>
</div>
</script>`;
export const DELETE_DIALOGTMP = `<script id="tmpl-delete-form-dialog" type="text/template">
<div id="delete-form-dialog">
  <form name="nform-delete" id="nform-delete">
  <div class="form-group">
      <label id="nid-delete-label" for="nid_delete">Id:</label>
      <p id="nid-delete" name="nid_delete"></p>
      <label id="nid-delete-error" class="error" for="nid_delete"></label>
    </div>
    <div class="form-group">
      <label id="text-delete-label" for="text_delete">Text:</label>
      <p id="text-delete" name="text_delete"></p>
      <label id="text-delete-error" class="error" for="text_delete"></label>
    </div>
  </form>
</div>
</script>`;