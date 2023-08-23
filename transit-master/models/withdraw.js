/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('withdraw', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		bank_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		transporter_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		amount: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			
			defaultValue:0
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
		tableName: 'withdraw'
	});
};
