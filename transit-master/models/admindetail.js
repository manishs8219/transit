/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('admindetail', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: true,
			
		},
		phone: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		password: {
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
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		wallet: {
			type: DataTypes.STRING(255),
			allowNull: false
		}
	}, {
		tableName: 'admindetail'
	});
};
