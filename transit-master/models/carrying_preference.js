/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('carrying_preference', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		category_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		prefrence: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
	   status: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		image: {
			type: DataTypes.STRING(255),
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
		tableName: 'carrying_preference'
	});
};
