/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('transporter_accounts', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		transpoter_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		bank_name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		bank_account: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		rout_number: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:1
		},
		holder_name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
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
		tableName: 'transporter_accounts'
	});
};
