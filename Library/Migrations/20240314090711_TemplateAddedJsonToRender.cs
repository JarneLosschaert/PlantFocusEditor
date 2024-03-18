using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Library.Migrations
{
    /// <inheritdoc />
    public partial class TemplateAddedJsonToRender : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Width",
                table: "Templates",
                newName: "WidthMillimeters");

            migrationBuilder.RenameColumn(
                name: "Height",
                table: "Templates",
                newName: "HeightMillimeters");

            migrationBuilder.AddColumn<string>(
                name: "JsonToRender",
                table: "Templates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JsonToRender",
                table: "Templates");

            migrationBuilder.RenameColumn(
                name: "WidthMillimeters",
                table: "Templates",
                newName: "Width");

            migrationBuilder.RenameColumn(
                name: "HeightMillimeters",
                table: "Templates",
                newName: "Height");
        }
    }
}
