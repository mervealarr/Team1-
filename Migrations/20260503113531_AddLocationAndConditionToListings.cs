using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwapSell.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationAndConditionToListings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Condition",
                table: "Listings",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Listings",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Condition",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Listings");
        }
    }
}
