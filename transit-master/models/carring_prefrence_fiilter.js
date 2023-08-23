/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('carring_prefrence_fiilter', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		transpoterid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue:''
		},
		category_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue:''
		},
	

		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 'carring_prefrence_fiilter'
	});
};
