export const EDIT_DIALOGTMP = `<script id="tmpl-edit-form-dialog" type="text/template">
<div id="edit-form-dialog">
  <form name="nform-edit" id="nform-edit">
  <div class="form-group">
      <label for="nid-edit">Id:</label>
      <input type="text" class="form-control" id="nid-edit" name="nid-edit" required>
      <label id="nid-edit-error" class="error" for="nid-edit"></label>
    </div>
    <div class="form-group">
      <label for="text">Text:</label>
      <input type="text" class="form-control" id="text-edit" name="text-edit" required>
      <label id="text-edit-error" class="error" for="text-edit"></label>
    </div>
  </form>
</div>
</script>`;
export const DELETE_DIALOGTMP = `<script id="tmpl-delete-form-dialog" type="text/template">
<div id="delete-form-dialog">
  <form name="nform-delete" id="nform-delete">
  <div class="form-group">
      <label for="nid-delete">Id:</label>
      <p id="nid-delete" name="nid-delete"></p>
      <label id="nid-delete-error" class="error" for="nid-delete"></label>
    </div>
    <div class="form-group">
      <label for="text">Text:</label>
      <p id="text-delete" name="text-delete"></p>
      <label id="text-delete-error" class="error" for="text-delete"></label>
    </div>
  </form>
</div>
</script>`;