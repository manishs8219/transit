/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('contactus', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userid: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '',
			field: 'userid'
		},
		name: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: '',
			field: 'name'
		},
		email: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: '',
			field: 'email'
		},
		message: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'message'
		},
		type: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0',
			field: 'type'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'created_at'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updated_at'
		}
	}, {
		tableName: 'contactus'
	});
};
