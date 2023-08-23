/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('prefrence_category', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		fillter_name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		transporter_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		prefrence_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		category_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		createdAt: {
			field:"created_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			field:"updated_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 'prefrence_category'
	});
};
